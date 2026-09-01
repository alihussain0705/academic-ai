from prompts.summarizer import SUMMARIZER_PROMPT
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage
from config import llm
from state import State
from utils.logger import logger

agent = create_agent(
        model = llm,
        system_prompt = SUMMARIZER_PROMPT
    )

def summarizer_agent(state: State):
    logger.info("Summarizer Agent Started")
    try:
        response = agent.invoke({
        "messages": [
            HumanMessage(content=f"Task: {state['task']} Research: {state['research']}")
        ]
        })

        logger.info("Summarizer Agent Ended")

        return {"summary":response['messages'][-1].content}
    except Exception as e:
            logger.exception(f"Summarizer Agent Failed: {e}")
            raise