# from graph_tools.runner import run_workflow
# from langchain_core.messages import HumanMessage
# from graph_tools.graph import graph

# messages = [
#     HumanMessage(content="What is a vector database.")
# ]
# messages2 = [
#     HumanMessage(content="Give me an example of it.")
# ]
# result = run_workflow(
#     "What is a vector database",
#     "student3",
#     messages = messages
# )
# result2 = run_workflow(
#     "Give me an example of it.",
#     "student3",
#     messages = messages2
# )

# config = {
#     "configurable": {
#         "thread_id": "student3"
#     }
# }

# state = graph.get_state(config)

# print(state.values["messages"])



# print(result2)

from config import llm

response = llm.invoke("What is Information Retrieval")
print(response.content)