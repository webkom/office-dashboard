from flask import Flask
from flask_caching import Cache
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from getters import get_public_members, get_repo_contibutors, get_repo_stats

app = Flask(__name__)

config = {
    "CACHE_TYPE": "SimpleCache",  # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 300,
}
app.config.from_mapping(config)
app.config.from_object("config.DevelopmentConfig")
app.config.from_prefixed_env()

cache = Cache(app)
api = Api(app)
cors = CORS(app, origins="*")


class OfficeDashboard(Resource):

    @cache.cached(timeout=50, key_prefix="get_dashboard")
    @cross_origin()
    def get(self):
        print("Using non-cached request")
        members = get_public_members(app)
        repo_contributors = get_repo_contibutors(app)
        repo_stats = get_repo_stats(app)

        return {
            "members": members,
            "repository_contributors": repo_contributors,
            "repository_stats": repo_stats,
        }


api.add_resource(OfficeDashboard, "/")

if __name__ == "__main__":
    app.run()
