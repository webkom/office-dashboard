from flask import Flask
import requests


def get_public_members(app: Flask):
    """
    Request data from members, and only include fields which may be public (i.e. NOT MAC/Bluetooth addresses)
    """

    url = f'https://{app.config["MEMBERS_URI"]}'

    try:
        members_res = requests.get(url=url, auth=(app.config["MEMBERS_USER"], app.config["MEMBERS_PASSWORD"]))
        members_json = members_res.json()

        return [
            {
                "name": member["name"],
                "full_name": member["full_name"],
                "birthday": member["birthday"],
                "joined": member["joined"],
                "first_lego_commit": member["first_lego_commit"],
                "avatar": member["avatar"],
                "slack": member["slack"],
                "phone_number": member["phone_number"],
                "github": member["github"],
                "brus": member["brus"],
                "active": member["active"],
                "new": member["new"],
            }
            for member in members_json
        ]

    except Exception as e:
        if app.config["DEBUG"]:
            raise Exception("Exception thrown while fetching members", e)
        else:
            raise Exception("Exception thrown while fetching members")


def get_repo_contibutors(app: Flask):
    """
    Use access token to fetch repository contribution statistics
    """

    url_lego = (
        "https://api.github.com/repos/webkom/lego/stats/contributors?per_page=100"
    )
    url_webapp = (
        "https://api.github.com/repos/webkom/lego-webapp/stats/contributors?per_page=100"
    )
    headers = {"Authorization": f'token {app.config["GITHUB_API_TOKEN"]}'}

    contributors = {}

    try:
        contribution_lego_res = requests.get(url=url_lego, headers=headers)
        contribution_lego_json = contribution_lego_res.json()

        for contributor in contribution_lego_json:
            contributors[contributor["author"]["login"]] = {
                "login": contributor["author"]["login"],
                "avatar_url": contributor["author"]["avatar_url"],
                "html_url": contributor["author"]["html_url"],
                "lego": contributor["total"],
            }

        contribution_webapp_res = requests.get(url=url_webapp, headers=headers)
        contribution_webapp_json = contribution_webapp_res.json()

        for contributor in contribution_webapp_json:
            if contributor["author"]["login"] not in contributors:
                contributors[contributor["author"]["login"]] = {
                    "login": contributor["author"]["login"],
                    "avatar_url": contributor["author"]["avatar_url"],
                    "html_url": contributor["author"]["html_url"],
                }

            contributors[contributor["author"]["login"]]["webapp"] = contributor[
                "total"
            ]

        return [ contributor for contributor in contributors.values()] 

    except Exception as e:
        if app.config["DEBUG"]:
            raise Exception("Exception thrown while fetching github contributors", e)
        else:
            raise Exception("Exception thrown while fetching github contributors")


def get_repo_stats(app: Flask):
    """
    Use access token to fetch repository statistics
    """

    url = "https://api.github.com/graphql"
    headers = {"Authorization": f'Bearer {app.config["GITHUB_API_TOKEN"]}'}

    query_string = """
    {
        lego: repository(owner: "webkom", name: "lego") {
        ...RepoFragment
        }
        webapp: repository(owner: "webkom", name: "lego-webapp") {
        ...RepoFragment
        }
        rateLimit {
        limit
        cost
        remaining
        resetAt
        }
    }
    fragment RepoFragment on Repository {
        nameWithOwner
        createdAt
        updatedAt
        pushedAt
        forkCount
        diskUsage
        hasIssuesEnabled
        stars: stargazers {
        totalCount
        }
        # collaborators {
        #   totalCount
        # }
        watchers {
        totalCount
        }
        commitComments {
        totalCount
        }
        totalPullRequests: pullRequests {
        totalCount
        }
        mergedPullRequests: pullRequests(states: MERGED) {
        totalCount
        }
        openPullRequests: pullRequests(states: OPEN) {
        totalCount
        }
        closedPullRequests: pullRequests(states: CLOSED) {
        totalCount
        }
        totalIssues: issues {
        totalCount
        }
        openIssues: issues(states: OPEN) {
        totalCount
        }
        closedIssues: issues(states: CLOSED) {
        totalCount
        }
        branches: refs(first: 0, refPrefix: "refs/heads/") {
        totalCount
        }
        primaryLanguage {
        name
        }
        languages(first: 100) {
        totalCount
        totalSize
        edges {
            node {
            ... on Language {
                name
                color
            }
            }
        }
        }
        commits: defaultBranchRef {
        target {
            ... on Commit {
            history(first: 0) {
                totalCount
            }
            }
        }
        }
    }
    """

    try:
        repo_stats_res = requests.post(
            url=url, json={"query": query_string}, headers=headers
        )
        repo_stats_json = repo_stats_res.json()

        return {
            "lego": parse_repo_stats("lego", repo_stats_json["data"]["lego"]),
            "webapp": parse_repo_stats("webapp", repo_stats_json["data"]["webapp"]),
        }
    except Exception as e:
        if app.config["DEBUG"]:
            raise Exception("Exception thrown while fetching github status", e)
        else:
            raise Exception("Exception thrown while fetching github status")


"""
HELPERS
"""


def parse_repo_stats(name, repository):
    return {
        "name": name,
        "created_at": repository["createdAt"],
        "updated_at": repository["updatedAt"],
        "pushed_at": repository["pushedAt"],
        "forks": repository["forkCount"],
        "stars": repository["stars"]["totalCount"],
        "disk_usage": repository["diskUsage"],
        "watchers": repository["watchers"]["totalCount"],
        "commits": repository["commits"]["target"]["history"]["totalCount"],
        "commit_comments": repository["commitComments"]["totalCount"],
        "pull_requests_total": repository["totalPullRequests"]["totalCount"],
        "pull_requests_merged": repository["mergedPullRequests"]["totalCount"],
        "pull_requests_open": repository["openPullRequests"]["totalCount"],
        "pull_requests_closed": repository["closedPullRequests"]["totalCount"],
        "issues_total": repository["totalIssues"]["totalCount"],
        "issues_open": repository["openIssues"]["totalCount"],
        "issues_closed": repository["closedIssues"]["totalCount"],
    }


def get_office_times(app: Flask):
    """
    Request data from Palantir API, get members office times
    """

    url = f"https://{app.config["PALANTIR_URI"]}/members"

    try:
        member_times_res = requests.get(url=url, auth=(app.config["PALANTIR_USER"], app.config["PALANTIR_PASSWORD"]))
        member_times_json = member_times_res.json()

        return [
            {
                "github_name": member["github_name"],
                "start_time": member["start_time"],
                "end_time": member["end_time"],
                "total_time": member["total_time"],
                "is_office_active": member["is_office_active"],
            }
            for member in member_times_json
        ]

    except Exception as e:
        if app.config["DEBUG"]:
            raise Exception("Exception thrown while fetching members times", e)
        else:
            raise Exception("Exception thrown while fetching members times")
