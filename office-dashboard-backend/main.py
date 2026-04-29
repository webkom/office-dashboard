from flask import Flask
from flask_caching import Cache
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
import importlib
from dotenv import load_dotenv
from fallback_call import FallbackCall

app = Flask(__name__)

load_dotenv()

config = {
    "CACHE_TYPE": "SimpleCache",  # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 300,
}

app.config.from_mapping(config)
app.config.from_prefixed_env("APP")

cache = Cache(app)
api = Api(app)
cors = CORS(app, origins="*")

if app.config["MOCK_REQUESTS"] == 'True':
    import mock_getters as getters
    print("Using mocked requests")
else:
    import getters

debug = app.config["DEBUG"] == 'True'

safe_get_public_members = FallbackCall(getters.get_public_members, debug=debug, default_value=[])
safe_get_repo_contributors = FallbackCall(getters.get_repo_contributors, debug=debug, default_value=[])
safe_get_repo_stats = FallbackCall(getters.get_repo_stats, debug=debug, default_value=[])
safe_get_office_times = FallbackCall(getters.get_office_times, debug=debug, default_value=[])
safe_get_brus = FallbackCall(getters.get_brus_users, debug=debug, default_value=[])


class OfficeDashboard(Resource):

    @cache.cached(timeout=50, key_prefix="get_dashboard")
    @cross_origin()
    def get(self):
        print("Using non-cached request")
        
        members, _ = safe_get_public_members(app)
        repo_contributors, _ = safe_get_repo_contributors(app)
        repo_stats, _ = safe_get_repo_stats(app)
        office_times, _ = safe_get_office_times(app)
        brus, _ = safe_get_brus(app)

        return {
            "members": members,
            "repository_contributors": repo_contributors,
            "repository_stats": repo_stats,
            "office_times": office_times,
            "brus": brus,
        }


api.add_resource(OfficeDashboard, "/")

if __name__ == "__main__":
    app.run()


