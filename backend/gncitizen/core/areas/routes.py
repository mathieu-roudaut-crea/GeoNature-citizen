from flask import Blueprint
from geojson import FeatureCollection

from .models import AreaModel

from gncitizen.utils.sqlalchemy import get_geojson_feature, json_resp

areas_api = Blueprint("areas", __name__)



def format_area(area, dashboard=False):
    feature = get_geojson_feature(area.geom)
    area_dict = area.as_dict(True)
    for k in area_dict:
        if k not in ("geom",):
            feature["properties"][k] = area_dict[k]
    return feature


def prepare_areas(areas, dashboard=False):
    count = len(areas)
    features = []
    for area in areas:
        formatted = format_area(area, dashboard)
        features.append(formatted)
    data = FeatureCollection(features)
    data["count"] = count
    return data


@areas_api.route("/programs/<int:id>", methods=["GET"])
@json_resp
def get_program_areas(id):
    """Get all areas
    ---
    tags:
      - Areas (External module)
    definitions:
      FeatureCollection:
        properties:
          type: dict
          description: area properties
        geometry:
          type: geojson
          description: GeoJson geometry
    responses:
      200:
        description: List of all areas
    """
    try:
        areas = AreaModel.query.filter_by(id_program=id).all()
        return prepare_areas(areas)
    except Exception as e:
        return {"error_message": str(e)}, 400

