// Base64 encoding/decoding for Chinese characters
export function encodeBase64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
      })
  );
}

export function decodeBase64(str) {
  return decodeURIComponent(
    atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
  );
}

export class GitHubAPI {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
  }

  async request(path, options = {}) {
    if (!this.token || !this.owner || !this.repo) {
      throw new Error('GitHub configuration is missing.');
    }
    const headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers
    };
    
    const response = await fetch(`${this.baseUrl}/${path}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API Error: ${response.status} ${errorData.message || response.statusText}`);
    }
    
    return response.json();
  }

  async getFile(path) {
    const data = await this.request(path);
    if (data.type === 'file' && data.content) {
      return {
        content: decodeBase64(data.content.replace(/\n/g, '')),
        sha: data.sha
      };
    }
    return data;
  }

  async updateFile(path, content, message, sha) {
    const body = {
      message,
      content: encodeBase64(content),
      sha
    };
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async deleteFile(path, message, sha) {
    const body = {
      message,
      sha
    };
    return this.request(path, {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  }
}
