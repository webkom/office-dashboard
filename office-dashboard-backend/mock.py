
def createUser(i):
    return {
          "active": True,
          "avatar": "",
          "birthday": f"1990-01-{i:02d}",
          "brus": "",
          "first_lego_commit": f"2025-02-{i:02d}",
          "full_name": f"Test User {i}",
          "github": f"gh_user{i}",
          "joined": f"2025-01-{i:02d}",
          "name": f"User {i}",
          "new": False,
          "phone_number": "",
          "slack": "",
          "welcome_messages": [
            "Velkommen til kontoret"
          ]
        }

def createRepoContributors(i):
    return {
          "avatar_url": "",
          "html_url": "",
          "lego": i,
          "login": f"gh_user{i}",
          "webapp": i
        },

def createRepoStats():
    stats = {
        "commit_comments": 10,
        "commits": 100,
        "created_at": "2000-01-01T00:00:00Z",
        "disk_usage": 10000,
        "forks": 10,
        "issues_closed": 100,
        "issues_open": 100,
        "issues_total": 300,
        "name": "lego",
        "pull_requests_closed": 100,
        "pull_requests_merged": 100,
        "pull_requests_open": 100,
        "pull_requests_total": 1000,
        "pushed_at": "2000-01-02T00:00:00Z",
        "stars": 10,
        "updated_at": "2000-01-03T00:00:00Z",
        "watchers": 2
    }
    
    return {
        "lego": stats,
        "webapp": stats
    }


def createOfficeTimes(i):
    return {
        "current_session_duration": 2,
        "github_name": f"gh_user{i}",
        "is_active": True,
        "last_seen": "2020-01-01T00:00:00Z",
        "total_time": 1000
    }

class Mock():

    num_users = 3

    @staticmethod
    def get_public_users():
        return [createUser(i) for i in range(Mock.num_users)]

    @staticmethod
    def get_repo_contributors():
        return [createRepoContributors(i) for i in range(Mock.num_users)]

    @staticmethod
    def get_repo_stats():
        return createRepoStats()

    @staticmethod
    def get_office_times():
        return [createOfficeTimes(i) for i in range(Mock.num_users)]
