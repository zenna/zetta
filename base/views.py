from django.core.context_processors import csrf
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
    """ Tell worker what to do """
    data = {'action':'start','codeUrl':'http://ec2-23-20-27-108.compute-1.amazonaws.com/static/js/test-job.js'}
    if request.method == "POST":
        response = HttpResponse(data, mimetype='application/json')
        response['Access-Control-Allow-Origin'] = "*"
    elif request.method == "OPTIONS":
        response = HttpResponse("")
        response['Access-Control-Allow-Origin'] = "*"
        response['Access-Control-Allow-Methods'] = "POST, OPTIONS"
        response['Access-Control-Allow-Headers'] = "X-Requested-With"
        response['Access-Control-Max-Age'] = "180"
    else:
        return HttpResponseBadRequest()
