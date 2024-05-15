# Creating a release

1. update version in package.json
   - if alpha release, the version should be something like this: 0.1.0-alpha.x
2. create release in github with the version as name and the release should create a tag with the same name as the version
3. CI should publish the new version to npm
