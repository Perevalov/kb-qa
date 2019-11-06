from flask import Flask, render_template, request, flash, session, url_for, redirect, make_response
from datetime import timedelta, datetime
from managers.DialogueManager import DialogueManager
from nlu.classifiers.KeywordClassifier import  KeywordClassifier
from resources import constants
from SPARQLWrapper import SPARQLWrapper, JSON

app = Flask(__name__)
app.secret_key = str(datetime.now().time())

classifier = KeywordClassifier(constants.CLASSES)
dialogue_manager = DialogueManager(classifier=classifier)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_answer", methods=['POST'])
def get_answer():
    print("get_answer Started")
    question_text = request.form.get("question_text")

    answer_text = dialogue_manager.get_answer(question_text)

    response_array = list()

    """for result in results["results"]["bindings"]:
        response_array.append({'City Label': result['cityLabel']['value'],
                            'Num. of Inhabitants': result['numberOfInhabitants']['value']})"""

    session['response'] = answer_text

    return redirect(url_for('index'))


if __name__ == "__main__":
    app.run(debug=True)
