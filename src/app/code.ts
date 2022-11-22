export const CI_CODE = `
# This workflow will do a clean installation of node dependencies, cache/restore them, build the source code and run tests across different versions of node
# For more information see: https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs

name: CI/CD
run-name: CI/CD Release by @\${{ github.actor }}

on:
  push:
    branches: [ "release" ]

jobs:
  test:
    name: Run Angular Uni Test
    runs-on: ubuntu-latest
    steps: 
      - uses: actions/checkout@v3
      - name: uni test
        uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - run: npm ci
      - run: npm test -- --watch=false --browsers=ChromeHeadless
  CI :
    name: Package and Create Release
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - name: uni test
        uses: actions/setup-node@v3
        with:
          node-version: 16.x
      - run: |
          npm ci
          npm run build
          tar -zcvf release.tgz ./dist
      - name: Read JSON
        id: version
        uses: ashley-taylor/read-json-property-action@v1.0
        with:
          path: ./package.json
          property: version

      - name: Create Release
        id: create_release
        uses: actions/create-release@master
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: alpha-v\${{ steps.version.outputs.value }}
          release_name: Release rc-\${{ steps.version.outputs.value }}
          draft: false # 是否是草稿
          prerelease: false # 是否是预发布

      - name: Upload Release Asset
        id: upload-release-asset
        uses: actions/upload-release-asset@master
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: \${{ steps.create_release.outputs.upload_url }}
          asset_path: ./release.tgz
          asset_name: release.tgz
          asset_content_type: application/x-tgz

  CD:
    name: Deploy App
    runs-on: ubuntu-latest
    needs: CI
    steps:
      - uses: actions/checkout@v3
      - name: Read JSON
        id: version
        uses: ashley-taylor/read-json-property-action@v1.0
        with:
          path: ./package.json
          property: version
      - name: Deploy
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: '45.77.25.170'
          username: 'root'
          password: \${{ secrets.SERVER_PASS }}
          port: '22'
          script: |
            cd \${{ secrets.DEPLOY_PATH }}
            rm -rf ./release.tgz
            wget https://github.com/su4g/ng-action/releases/download/alpha-v\${{ steps.version.outputs.value }}/release.tgz
            tar -zxvf release.tgz --strip-components=3

        

`

export const TEST_CODE = `

name: Auto run unitest

on:
  push:
    branches: [ "karma" ]
  pull_request:
    branches: [ "karma" ]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm test -- --watch=false --browsers=ChromeHeadless
`