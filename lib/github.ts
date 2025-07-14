interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  license: {
    spdx_id: string;
  } | null;
  description: string;
  topics: string[];
  language: string;
}

export async function getGitHubRepoInfo(
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        }),
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}
