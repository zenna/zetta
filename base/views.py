from django.core.context_processors import csrf
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.db.models import Q
from django.core.paginator import Paginator, InvalidPage, EmptyPage

def home(request):
    """ Generate main content
        Take filter / order by restraints from POST
    """
    return render_to_response('simulation.html')

def probe(request):
    return 

def get_orders(request):
    """ Tell worker what to do """
    response_data['action'] = 'probe'
    return HttpResponse(json.dumps(response_data), mimetype="application/json")