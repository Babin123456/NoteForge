from fastapi import APIRouter
from datetime import datetime, timedelta
import json
from app.storage.database import db

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview")
def get_analytics_overview():
    # Documents
    doc_count_res = db.execute_query("SELECT COUNT(*) as cnt FROM documents")
    total_docs = doc_count_res[0]["cnt"] if doc_count_res else 0
    
    # Flashcards
    flash_count_res = db.execute_query("SELECT COUNT(*) as cnt FROM flashcards")
    total_cards = flash_count_res[0]["cnt"] if flash_count_res else 0
    
    known_res = db.execute_query("SELECT COUNT(*) as cnt FROM flashcards WHERE status = 'known'")
    known_cards = known_res[0]["cnt"] if known_res else 0
    
    review_res = db.execute_query("SELECT COUNT(*) as cnt FROM flashcards WHERE status = 'review'")
    review_cards = review_res[0]["cnt"] if review_res else 0
    
    # Quizzes
    quiz_res = db.execute_query("SELECT COUNT(*) as cnt FROM quiz_results")
    total_quizzes = quiz_res[0]["cnt"] if quiz_res else 0
    
    avg_accuracy_res = db.execute_query("SELECT AVG(accuracy_percentage) as avg_acc FROM quiz_results")
    overall_accuracy = round(avg_accuracy_res[0]["avg_acc"], 1) if avg_accuracy_res and avg_accuracy_res[0]["avg_acc"] is not None else 0.0
    
    # Study duration
    duration_res = db.execute_query("SELECT SUM(duration_seconds) as total_dur FROM study_sessions")
    total_duration_sec = duration_res[0]["total_dur"] if duration_res and duration_res[0]["total_dur"] is not None else 0
    total_duration_min = round(total_duration_sec / 60)
    
    # Calculate learning streak
    streak = 0
    sessions_by_date = db.execute_query("""
        SELECT DISTINCT SUBSTR(created_at, 1, 10) as study_date 
        FROM study_sessions 
        ORDER BY study_date DESC
    """)
    dates = [r["study_date"] for r in sessions_by_date]
    today_str = datetime.now().strftime("%Y-%m-%d")
    yesterday_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    if dates:
        if dates[0] == today_str or dates[0] == yesterday_str:
            cur = datetime.strptime(dates[0], "%Y-%m-%d")
            streak = 1
            for d_str in dates[1:]:
                d = datetime.strptime(d_str, "%Y-%m-%d")
                if (cur - d).days == 1:
                    streak += 1
                    cur = d
                else:
                    break
                    
    # Weekly Activity (past 7 days)
    weekly_activity = []
    for i in range(6, -1, -1):
        day_date = datetime.now() - timedelta(days=i)
        day_str = day_date.strftime("%Y-%m-%d")
        day_label = day_date.strftime("%a")
        
        stat_res = db.execute_query("""
            SELECT 
                COUNT(*) as session_count,
                COALESCE(SUM(duration_seconds), 0) / 60 as minutes,
                COALESCE(AVG(accuracy_percentage), 0) as acc
            FROM study_sessions 
            WHERE SUBSTR(created_at, 1, 10) = ?
        """, (day_str,))
        
        row = stat_res[0] if stat_res else {}
        weekly_activity.append({
            "date": day_str,
            "day": day_label,
            "sessions": row.get("session_count", 0),
            "minutes": round(row.get("minutes", 0), 1),
            "accuracy": round(row.get("acc", 0), 1)
        })
        
    # Recent sessions
    recent_sessions_rows = db.execute_query("""
        SELECT s.*, d.title as document_title 
        FROM study_sessions s 
        LEFT JOIN documents d ON s.document_id = d.id 
        ORDER BY s.created_at DESC LIMIT 5
    """)
    
    # Recent documents
    recent_docs_rows = db.execute_query("SELECT * FROM documents ORDER BY updated_at DESC LIMIT 5")
    recent_docs = []
    for r in recent_docs_rows:
        item = dict(r)
        item["topics"] = json.loads(item["topics"]) if item.get("topics") else []
        recent_docs.append(item)
        
    # Topic performance & Incorrect concepts from quiz results
    incorrect_concepts = []
    topic_map = {}
    
    all_results = db.execute_query("SELECT breakdown FROM quiz_results ORDER BY created_at DESC LIMIT 20")
    for res_row in all_results:
        breakdown = json.loads(res_row["breakdown"]) if res_row.get("breakdown") else []
        for item in breakdown:
            t = item.get("topic") or "General"
            if t not in topic_map:
                topic_map[t] = {"total": 0, "correct": 0}
            topic_map[t]["total"] += 1
            if item.get("is_correct"):
                topic_map[t]["correct"] += 1
            else:
                incorrect_concepts.append({
                    "question": item.get("question_text"),
                    "user_answer": item.get("user_answer"),
                    "correct_answer": item.get("correct_answer"),
                    "explanation": item.get("explanation"),
                    "topic": t
                })
                
    topic_performance = []
    for t_name, data in topic_map.items():
        acc = round((data["correct"] / data["total"]) * 100, 1) if data["total"] > 0 else 0
        topic_performance.append({
            "topic": t_name,
            "total_questions": data["total"],
            "accuracy": acc
        })
        
    return {
        "total_documents": total_docs,
        "total_flashcards": total_cards,
        "total_quizzes_completed": total_quizzes,
        "learning_streak_days": streak,
        "overall_accuracy": overall_accuracy,
        "total_study_duration_minutes": total_duration_min,
        "flashcards_known": known_cards,
        "flashcards_need_review": review_cards,
        "weekly_activity": weekly_activity,
        "recent_sessions": [dict(s) for s in recent_sessions_rows],
        "recent_documents": recent_docs,
        "topic_performance": topic_performance,
        "incorrect_concepts": incorrect_concepts[:6]
    }
