from flask import Flask, render_template, request, flash, session, url_for, redirect, make_response
from passlib.hash import sha256_crypt
from datetime import timedelta, datetime
import requests
from SPARQLWrapper import SPARQLWrapper, JSON
import spacy

nlp = spacy.load("en_core_web_sm")
app = Flask(__name__)
app.secret_key = str(datetime.now().time())

def get_cities_for_a_text(text):
    doc = nlp(text)

    cities = list()
    for ent in doc.ents:
        if ent.label_ == 'GPE':
            cities.append(ent.text)

    return cities

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_answer", methods=['POST'])
def get_answer():
    print("get_answer Started")
    question_text = request.form.get("question_text")

    cities = get_cities_for_a_text(question_text)

    sparql = SPARQLWrapper("http://dbpedia.org/sparql")
    sparql.setQuery("""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX yago: <http://dbpedia.org/class/yago/>
        SELECT DISTINCT ?cityLabel ?numberOfInhabitants
        WHERE {
                 VALUES ?placeType { dbo:City yago:City108524735 }
                 ?s rdf:type ?placeType .
                 ?s rdfs:label ?cityLabel .
                 filter(contains(lcase(?cityLabel),"%s")) .
                 filter(LANG(?cityLabel) = "en") .
                 ?s dbo:populationTotal ?numberOfInhabitants .  
        }
        ORDER BY DESC (?numberOfInhabitants)
        LIMIT 100
    """ % (cities[0].lower()))

    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    response_array = list()

    for result in results["results"]["bindings"]:
        response_array.append({'City Label': result['cityLabel']['value'],
                               'Num. of Inhabitants': result['numberOfInhabitants']['value']})

    session['response'] = response_array

    print("get_answer Ended")

    return redirect(url_for('index'))


if __name__ == "__main__":
    app.run(debug=True)
