from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseBadRequest
import simplejson as json
from cors import *

def probe(request):
    return 

def process_response(self, response):
    if response.has_header('Access-Control-Allow-Origin'):
            return response
               
    response['Access-Control-Allow-Origin'] = '*'
    return response




def get_orders(request):
    """ """
    data = {'action':'start', 'codeUrl':'http://localhost:8080/static/js/whatwhat.js'}
    
    if request.method == "POST":
        response = HttpResponse(json.dumps(data), mimetype='application/json')
        response['Access-Control-Allow-Origin'] = "*"
        return response
    elif request.method == "OPTIONS":
        response = HttpResponse("")
        response['Access-Control-Allow-Origin'] = "*"
        response['Access-Control-Allow-Methods'] = "POST, OPTIONS"
        response['Access-Control-Allow-Headers'] = "X-Requested-With, X-Custom-Header"
        response['Access-Control-Max-Age'] = "180"
        return response
    else:
        return HttpResponseBadRequest()