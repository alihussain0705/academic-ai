from graph_tools.runner import run_workflow
from langchain_core.messages import HumanMessage
from ..user import UserProfile
from state import State

def handle_chat(task: str, thread_id: str,user: UserProfile):
    messages = [
        HumanMessage(content = task)
    ]
    result = run_workflow(
        task = task,
        thread_id = thread_id,
        messages = messages,
        semester=user.semester,
        department = user.department,
        college=user.college,
        subject = user.subject
    )
    return {
        "response": result["article"],
        "thread_id": thread_id
    }