---
name: github-pr-media
description: Upload an image or video to GitHub's user attachments API and embed it in a pull request description or comment. Use when asked to add screenshots, diagrams, recordings, or other media to a PR or GitHub comment.
user-invocable: false
---

# GitHub PR Media Uploads

Use this skill when a workspace agent needs to attach screenshots, diagrams, or videos to a pull request description or comment.

## When to use it

- Adding before/after screenshots to explain a UI change
- Sharing a diagram that clarifies architecture or flow
- Attaching a short recording that makes behavior easier to review
- Turning a local media file into a GitHub-hosted URL that can be linked from markdown

Only use this when visuals genuinely improve reviewer understanding.

## Instructions

1. Put the real values in shell variables first, so the untrusted filename is never
   pasted into the middle of another command. Set `TARGET` to the PR (or comment) you
   were asked to update, and `REPO` to that target's `owner/repo` — do **not** assume
   the current checkout is the right repository:

    ```bash
    FILE='assets/dashboard.png'          # path to the media file on disk
    NAME="$(basename -- "$FILE")"         # display name shown in the attachment
    MIME='image/png'                      # actual MIME type (e.g. video/mp4 for video)
    TARGET='https://github.com/OWNER/REPO/pull/123'
    REPO='OWNER/REPO'                     # owner/repo that owns TARGET
    ```

    Never build these from `$(...)` command substitution embedded in an untrusted
    filename — assign the filename to `FILE` with single quotes, then reference `"$FILE"`.

2. Resolve the repository database id for `REPO`, failing loudly if the lookup does not
   return a numeric id:

    ```bash
    REPO_ID="$(gh api "repos/$REPO" --jq .id)" || { echo "repo lookup failed" >&2; exit 1; }
    case "$REPO_ID" in ''|*[!0-9]*) echo "no repository_id for $REPO" >&2; exit 1;; esac
    ```

3. Upload the raw media bytes to GitHub. Everything untrusted stays inside a quoted
   variable, and `--url-query` URL-encodes each value:

    ```bash
    URL="$(curl --fail-with-body -sS -X POST \
      "https://uploads.github.com/user-attachments/assets" \
      --url-query "name=$NAME" \
      --url-query "content_type=$MIME" \
      --url-query "repository_id=$REPO_ID" \
      -H "Content-Type: application/octet-stream" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      -H "Authorization: Bearer $(gh auth token)" \
      --data-binary "@$FILE" | jq -r .url)"
    case "$URL" in https://*) ;; *) echo "upload failed: $URL" >&2; exit 1;; esac
    ```

    On GitHub Enterprise Server the upload host is not `uploads.github.com`; substitute
    your instance's uploads host (the `uploadsUrl` for the configured `gh` endpoint).

4. `URL` now holds the hosted attachment link, which looks like:

    ```text
    https://github.com/user-attachments/assets/...
    ```

5. Embed the hosted URL in markdown and **actually submit it** to the requested target —
   showing the markdown is not enough, you must update the PR or comment:

    ```bash
    # For a PR description: fetch, append, and write it back.
    BODY="$(gh pr view "$TARGET" --repo "$REPO" --json body -q .body)"
    printf '%s\n\n![%s](%s)\n' "$BODY" "$NAME" "$URL" \
      | gh pr edit "$TARGET" --repo "$REPO" --body-file -

    # For a new PR comment instead:
    # gh pr comment "$TARGET" --repo "$REPO" --body "![$NAME]($URL)"
    ```

    Use `![alt text](url)` for images. For video or other non-image media, paste the URL
    on its own line (GitHub renders a player) or use a plain markdown link if that reads
    better in context.

## Important details

- Send the file as raw binary bytes with `--data-binary "@$FILE"`. Do **not** use
  multipart form uploads, base64 encoding, or JSON wrappers.
- Put `name`, `content_type`, and `repository_id` in the query string via `--url-query`,
  which URL-encodes each value. Never interpolate them directly into the URL — a filename
  with spaces, `&`, `#`, or other reserved characters would corrupt the request.
- Keep untrusted filenames inside quoted shell variables; never paste them into the body
  of another command where shell metacharacters could be evaluated.
- `--url-query` needs curl >= 7.87 and `--fail-with-body` needs curl >= 7.76. On older
  curl, encode the query manually and use `--fail --show-error` (which exits nonzero but
  discards the error body).
- Always confirm a `https://` `url` came back before embedding it, so an expired token or
  4xx/5xx response fails the task instead of silently succeeding.
- For videos, keep the same request shape and set `MIME` to the real video MIME type, for
  example `video/mp4`.

## When not to use it

- Text-only changes where the diff already explains everything
- Cases where a simple markdown list or code snippet is clearer than an image
