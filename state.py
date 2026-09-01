from typing import TypedDict,Annotated
from langgraph.graph import add_messages

class State(TypedDict):

    messages: Annotated[list,add_messages]
    task: str
    research: str
    summary: str
    review: str
    article: str
    final_report: str

    plan: list[str]
    current_step: int
    route: str

    college: str
    department: str
    semester: int
    subject: str

    web_used: bool