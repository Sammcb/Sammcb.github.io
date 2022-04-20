---
layout: readable
permalink: /syncsong/spotify-callback
title: Sync Song Spotify Callback
---
This page is used as the callback point for Spotify when authenticating via the Sync Song app. If you were not redirected back to the app, then it is likely the authentication failed. Check the URL query params for issues. If `code` and `state` are present, the authentication succeeded and there must have been an error redirecting to the app. If `error` and `state` is present the authentication failed.
