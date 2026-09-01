from graph_tools.graph import graph
from utils.logger import logger


def run_workflow(
    task: str,
    thread_id: str,
    messages: list,
    college: str,
    semester: int,
    department: str,
    subject: str
):
    try:

        config = {
            "configurable": {
                "thread_id": thread_id
            }
        }

        result = graph.invoke(
            {
                "task": task,
                "messages": messages,

                # Reset workflow state for this question
                "research": "",
                "summary": "",
                "review": "",
                "article": "",
                "final_report": "",

                "plan": [],
                "current_step": 0,
                "route": "",
                "web_used": False,

                # Current student's metadata
                "semester": semester,
                "college": college,
                "department": department,
                "subject": subject
            },
            config=config
        )

        return result

    except Exception as e:
        logger.exception(f"Workflow Failed: {e}")
        raise