# KB-QA (Knowledge base Question-Answering)
This repository contains simple question answering system which is working on top of knowledge base

## Project set up

Navigate to project folder and run following commands in the terminal:

`pip install -r requirements.txt`

`python -m spacy download en_core_web_sm --default-timeout=50000`

*Note:* Sometimes spacy has download issues. Therefore, increasing the timeout is recommended.

## Status of the project

Currently system can answer only questions related to intent "How many people live in X?" (where X is a city name). To be extended ...
