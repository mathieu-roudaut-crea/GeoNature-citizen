#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import current_app
import requests

from gncitizen.utils.env import MUNICIPALITY_URL

# Get municipality id
#       newobs.municipality = get_municipality_id_from_wkb_point(
#           db, newobs.geom
#       )


def get_municipality_id_from_wkb(wkb):
    """Return municipality id from wkb geometry

    :param wkb: WKB geometry (epsg 4326)
    :type wkb: str

    :return: municipality id
    :rtype: int
    """
    try:
        municipality = get_municipality_from_lat_long(
                                        lat=wkb["y"], 
                                        lon=wkb["x"])
        municipality_id = municipality.get('city', None)
        if municipality_id is None:
            municipality_id = municipality.get('town', None)
    except Exception as e:
        current_app.logger.debug(
            "[get_municipality_id_from_wkb_point] Can't get municipality id: {}".format(
                str(e)
            )
        )
        raise
    return municipality_id


def get_municipality_from_lat_long(lat: int, lon: int) -> dict:
    municipality = {}
    resp = requests.get(f'{MUNICIPALITY_URL}?lat={lat}&lon={lon}&format=json',timeout=10)
    if resp.ok:
        municipality = resp.json().get('address', {})
    return municipality

