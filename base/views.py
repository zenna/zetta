from django.core.context_processors import csrf
from django.shortcuts import render_to_response
from django.http import HttpResponse

def probe(request):
    return 

def get_orders(request):
    """ Tell worker what to do """
    response_data['action'] = 'probe'
    return HttpResponse(json.dumps(response_data), mimetype="application/json")