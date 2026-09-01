from prompts.writer import WRITER_PROMPT
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage,AIMessage
from config import llm
from state import State
from utils.logger import logger

agent = create_agent(
        model = llm,
        system_prompt = WRITER_PROMPT
    )

def writer_agent(state: State):
    logger.info("Writer Agent Started")
    try:
        response = agent.invoke({
        "messages": [
            HumanMessage(
        content=f"""
                Task:
                {state["task"]}

                Research:
                {state.get("research", "")}

                Summary:
                {state.get("summary", "")}

                Review:
                {state.get("review", "")}
                """
                )
                    ]
                })
        article = response["messages"][-1].content

        if state.get("web_used"):
            article += "\n\n⚠️ This answer uses web information because the requested information was not found in your course materials."
    
        logger.info("Writer Agent Ended")

        return {
             "article":article,
             "messages":[AIMessage(content = response['messages'][-1].content)]
             }
    except Exception as e:
            logger.exception(f"Writer Agent Failed: {e}")
            raise