from django.core.context_processors import csrf
from django.shortcuts import render_to_response
from django.http import HttpResponse
import simplejson as json
from cors import *

def probe(request):
    return 

def get_orders(request):
    """ Tell worker what to do """
    response_data = {}
    response_data['action'] = 'probe'
    xs = XsSharing()
    response = xs.process_response(json.dumps(response_data))
    return HttpResponse(response, mimetype="application/json")
