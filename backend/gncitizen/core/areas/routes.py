import uuid

from flask import Blueprint, request, current_app, json
from geojson import FeatureCollection
from server import db

from shapely.geometry import asShape, Point
from geoalchemy2.shape import from_shape
from flask_jwt_extended import jwt_required

from .models import AreaModel, SpeciesSiteModel, SpeciesSiteObservationModel
from gncitizen.utils.errors import GeonatureApiError
from gncitizen.utils.jwt import get_id_role_if_exists
from gncitizen.utils.sqlalchemy import get_geojson_feature, json_resp
from gncitizen.core.users.models import UserModel
from gncitizen.core.commons.models import ProgramsModel

areas_api = Blueprint("areas", __name__)


def format_entity(data, with_geom=True):
    feature = get_geojson_feature(data.geom)
    print(data, feature)
    area_dict = data.as_dict(True)
    if with_geom:
        for k in area_dict:
            if k not in ("geom",):
                feature["properties"][k] = area_dict[k]
    return feature


def prepare_list(data, with_geom=True):
    count = len(data)
    features = []
    for element in data:
        formatted = format_entity(element, with_geom)
        features.append(formatted)
    data = FeatureCollection(features)
    data["count"] = count
    return data


@areas_api.route("/program/<int:pk>/jsonschema", methods=["GET"])
@json_resp
def get_area_jsonschema_by_program(pk):
    try:
        program = ProgramsModel.query.get(pk)
        data_dict = program.area_custom_form.json_schema
        return data_dict, 200
    except Exception as e:
        return {"error_message": str(e)}, 400


@areas_api.route("/<int:pk>/jsonschema", methods=["GET"])
@json_resp
def get_area_jsonschema(pk):
    try:
        area = AreaModel.query.get(pk)
        data_dict = area.program.area_custom_form.json_schema
        return data_dict, 200
    except Exception as e:
        return {"error_message": str(e)}, 400


@areas_api.route("/<int:pk>/species_site/jsonschema", methods=["GET"])
@json_resp
def get_species_site_jsonschema(pk):
    try:
        area = AreaModel.query.get(pk)
        data_dict = area.program.species_site_custom_form.json_schema
        return data_dict, 200
    except Exception as e:
        return {"error_message": str(e)}, 400


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
        return prepare_list(areas)
    except Exception as e:
        return {"error_message": str(e)}, 400


@areas_api.route("/<int:pk>", methods=["GET"])
@json_resp
def get_area(pk):
    """Get an area by id
    ---
    tags:
      - Areas (External module)
    parameters:
      - name: pk
        in: path
        type: integer
        required: true
        example: 1
    definitions:
      properties:
        type: dict
        description: area properties
      geometry:
        type: geojson
        description: GeoJson geometry
    responses:
      200:
        description: An area detail
    """
    try:
        area = AreaModel.query.get(pk)
        formatted_area = format_entity(area)
        species_sites = prepare_list(
            SpeciesSiteModel.query.filter_by(id_area=pk)
                .order_by(SpeciesSiteModel.timestamp_update.desc())
                .all()
        )
        formatted_area["properties"]["species_sites"] = species_sites
        return {"features": [formatted_area]}, 200
    except Exception as e:
        return {"error_message": str(e)}, 400


@areas_api.route("/species_sites/<int:pk>", methods=["GET"])
@json_resp
def get_species_site(pk):
    """Get an species site by id
    ---
    tags:
      - Areas (External module)
    parameters:
      - name: pk
        in: path
        type: integer
        required: true
        example: 1
    definitions:
      properties:
        type: dict
        description: species site properties
      geometry:
        type: geojson
        description: GeoJson geometry
    responses:
      200:
        description: A species site detail
    """
    try:
        species_site = SpeciesSiteModel.query.get(pk)
        formatted_species_site = format_entity(species_site)
        observations = prepare_list(
            SpeciesSiteObservationModel.query.filter_by(id_species_site=pk)
                .order_by(SpeciesSiteObservationModel.timestamp_update.desc())
                .all(),
            with_geom=False
        )
        formatted_species_site["properties"]["observations"] = observations
        return {"features": [formatted_species_site]}, 200
    except Exception as e:
        return {"error_message": str(e)}, 400



@areas_api.route("/", methods=["POST"])
@json_resp
@jwt_required(optional=True)
def post_area():
    """Ajout d'une zone
    Post an area
        ---
        tags:
          - Areas (External module)
        summary: Creates a new area
        consumes:
          - application/json
        produces:
          - application/json
        parameters:
          - name: body
            in: body
            description: JSON parameters.
            required: true
            schema:
              id: Area
              properties:
                id_program:
                  type: integer
                  description: Program foreign key
                  required: true
                  example: 1
                name:
                  type: string
                  description: Area name
                  default:  none
                  example: "Area 1"
                geometry:
                  type: string
                  example: {"type":"Point", "coordinates":[5,45]}
        responses:
          200:
            description: Area created
        """
    try:
        request_data = dict(request.get_json())

        datas2db = {}
        for field in request_data:
            if hasattr(AreaModel, field):
                datas2db[field] = request_data[field]
        current_app.logger.debug("datas2db: %s", datas2db)
        try:
            new_area = AreaModel(**datas2db)
        except Exception as e:
            current_app.logger.debug(e)
            raise GeonatureApiError(e)

        try:
            json_data = request_data.get("json_data")
            if json_data is not None:
                new_area.json_data = json.loads(json_data)
        except Exception as e:
            current_app.logger.warning("[post_observation] json_data ", e)
            raise GeonatureApiError(e)

        try:
            shape = asShape(request_data["geometry"])
            new_area.geom = from_shape(Point(shape), srid=4326)
        except Exception as e:
            current_app.logger.debug(e)
            raise GeonatureApiError(e)

        id_role = get_id_role_if_exists()
        if id_role is not None:
            new_area.id_role = id_role
            role = UserModel.query.get(id_role)
            new_area.obs_txt = role.username
            new_area.email = role.email
        else:
            if new_area.obs_txt is None or len(new_area.obs_txt) == 0:
                new_area.obs_txt = "Anonyme"

        new_area.uuid_sinp = uuid.uuid4()

        db.session.add(new_area)
        db.session.commit()
        # Réponse en retour
        result = AreaModel.query.get(new_area.id_area)
        return {"message": "New area created.", "features": [format_entity(result)]}, 200
    except Exception as e:
        current_app.logger.warning("Error: %s", str(e))
        return {"error_message": str(e)}, 400


@areas_api.route("/species_sites/", methods=["POST"])
@json_resp
@jwt_required(optional=True)
def post_species_site():
    """Ajout d'un site d'individu
    Post a species site
        ---
        tags:
          - Areas (External module)
        summary: Creates a new species site
        consumes:
          - application/json
        produces:
          - application/json
        parameters:
          - name: body
            in: body
            description: JSON parameters.
            required: true
            schema:
              id: Area
              properties:
                id_area:
                  type: integer
                  description: Area foreign key
                  required: true
                  example: 1
                name:
                  type: string
                  description: Species site name
                  default:  none
                  example: "Species site 1"
                geometry:
                  type: string
                  example: {"type":"Point", "coordinates":[5,45]}
        responses:
          200:
            description: Species site created
        """
    try:
        request_data = dict(request.get_json())

        datas2db = {}
        for field in request_data:
            if hasattr(SpeciesSiteModel, field):
                datas2db[field] = request_data[field]
        current_app.logger.debug("datas2db: %s", datas2db)
        try:
            new_species_site = SpeciesSiteModel(**datas2db)
        except Exception as e:
            current_app.logger.debug(e)
            raise GeonatureApiError(e)

        try:
            json_data = request_data.get("json_data")
            if json_data is not None:
                new_species_site.json_data = json.loads(json_data)
        except Exception as e:
            current_app.logger.warning("[post_observation] json_data ", e)
            raise GeonatureApiError(e)

        try:
            shape = asShape(request_data["geometry"])
            new_species_site.geom = from_shape(Point(shape), srid=4326)
        except Exception as e:
            current_app.logger.debug(e)
            raise GeonatureApiError(e)

        id_role = get_id_role_if_exists()
        if id_role is not None:
            new_species_site.id_role = id_role
            role = UserModel.query.get(id_role)
            new_species_site.obs_txt = role.username
            new_species_site.email = role.email
        else:
            if new_species_site.obs_txt is None or len(new_species_site.obs_txt) == 0:
                new_species_site.obs_txt = "Anonyme"

        new_species_site.uuid_sinp = uuid.uuid4()

        db.session.add(new_species_site)
        db.session.commit()
        # Réponse en retour
        result = SpeciesSiteModel.query.get(new_species_site.id_species_site)
        return {"message": "New species site created.", "features": [format_entity(result)]}, 200
    except Exception as e:
        current_app.logger.warning("Error: %s", str(e))
        return {"error_message": str(e)}, 400
