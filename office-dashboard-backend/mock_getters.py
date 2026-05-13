
def createMember(i):
    return {
          "active": True,
          "avatar": "",
          "github": f"gh_user{i}",
          "name": f"User {i}",
          "birthday": f"1990-01-{i:02d}",
          "welcome_messages": [
            "Velkommen til kontoret"
          ],
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
        "current_session_duration": 0,
        "github_name": f"gh_user{i}",
        "is_active": 1,
        "last_seen": "2026-04-24T08:30:00Z",
        "total_time": 1000 * 3600
    }

num_users = 3

def get_public_members(_app):
    return [createMember(i) for i in range(num_users)]

def get_repo_contributors(_app):
    return [createRepoContributors(i) for i in range(num_users)]

def get_repo_stats(_app):
    return createRepoStats()

def get_office_times(_app):
    return [createOfficeTimes(i) for i in range(num_users)]
