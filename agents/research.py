from typing import TypedDict

from langchain.agents import create_agent
from langchain_core.messages import BaseMessage,HumanMessage

from config import llm
from state import State

from tools.web_search import web_search_tool
from tools.rag_tool import rag_tool

from prompts.research import RESEARCH_PROMPT
from utils.logger import logger

class ResearchState(TypedDict):
    messages: list[BaseMessage]
    semester: int
    department: str
    college: str
    subject: str


def research_agent(state: State):

    logger.info("Research Agent Started")

    print("\n========== RESEARCH STATE ==========")
    print("COLLEGE:", repr(state.get("college")))
    print("DEPARTMENT:", repr(state.get("department")))
    print("SEMESTER:", repr(state.get("semester")))
    print("SUBJECT:", repr(state.get("subject")))
    print("TASK:", repr(state.get("task")))
    print("====================================")

    # Create a RAG tool specifically for THIS request.
    # Metadata comes from Python state, NOT from the LLM.
    def academic_rag(question: str) -> str:
        """Search the student's academic materials using the current academic context."""
        print("\n========== RAG FROM RESEARCH AGENT ==========")
        print("COLLEGE:", repr(state["college"]))
        print("DEPARTMENT:", repr(state["department"]))
        print("SEMESTER:", repr(state["semester"]))
        print("SUBJECT:", repr(state["subject"]))
        print("============================================")

        return rag_tool.invoke({
            "question": question,
            "college": state["college"],
            "department": state["department"],
            "semester": state["semester"],
            "subject": state["subject"],
        })


    # Give the wrapper a proper tool name.
    from langchain_core.tools import tool

    academic_rag = tool("academic_rag")(academic_rag)


    tools = [
        academic_rag,
        web_search_tool
    ]


    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=RESEARCH_PROMPT,
    )


    try:
        print("\n========== RESEARCH QUESTION ==========")
        print("TASK:", repr(state["task"]))
        print("MESSAGES:", state["messages"])
        print("=======================================\n")

        response = agent.invoke({
        "messages": state["messages"],
        "college": state["college"],
        "department": state["department"],
        "semester": state["semester"],
        "subject": state["subject"],
        })
        print("\n========== RESEARCH RESPONSE ==========")

        for message in response["messages"]:
            print("TYPE:", type(message).__name__)
            print("NAME:", getattr(message, "name", None))
            print("CONTENT:", getattr(message, "content", None))
            print("TOOL CALLS:", getattr(message, "tool_calls", None))
            print("---------------------------------------")

            print("========================================\n")

        logger.info(
            f"Research agent messages: {response['messages']}"
        )


        web_used = False

        for message in response["messages"]:

            if getattr(message, "name", None) == "web_search_tool":
                web_used = True


        content = response["messages"][-1].content


        if isinstance(content, list):

            text_parts = []

            for block in content:

                if (
                    isinstance(block, dict)
                    and block.get("type") == "text"
                ):
                    text_parts.append(
                        block.get("text", "")
                    )

            content = "\n".join(text_parts)


        return {
            "research": content,
            "web_used": web_used
        }


    except Exception as e:

        logger.exception(
            f"Research Agent Failed: {e}"
        )

        raise