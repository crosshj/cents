pipeline {
    agent any

    options {
        buildDiscarder(logRotator(
            numToKeepStr: '10',
            artifactNumToKeepStr: '10'
        ))
    }
    /*
        https://stackoverflow.com/a/44155346

        daysToKeepStr: history is only kept up to this days.
        numToKeepStr: only this number of build logs are kept.
        artifactDaysToKeepStr: artifacts are only kept up to this days.
        artifactNumToKeepStr: only this number of builds have their artifacts kept.
    */

    // environment { 
    // }

    stages {
        stage('Build') {
            steps {
                script {
                    NODE_VERSION = sh(
                        returnStdout: true,
                        script: 'node -v'
                    ).trim()

                    NPM_VERSION = sh(
                        returnStdout: true,
                        script: 'npm -v'
                    ).trim()
                }
                echo "NODE: " + NODE_VERSION + ", " + "NPM: " + NPM_VERSION
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Analyze') {
            steps {
                parallel (
                    "test" : {
                        sh 'npm run test.ci'
                    },
                    "lint" : {
                        sh 'npm run lint'
                    },
                    "build stats": {
                        echo 'TODO: build/dist analysis (jenkins plugin?) - https://survivejs.com/webpack/optimizing/build-analysis/'
                        sh 'npm run bundle.stats'
                    },
                    "audit": {
                        sh 'mv .npmrc .no-npmrc && npm i --package-lock-only && mv .no-npmrc .npmrc && npm audit'
                    }
                )
            }
            post {
                always {
                    junit 'build/reports/*.xml'
                    cobertura coberturaReportFile: 'build/coverage/cobertura-coverage.xml'
                }
            }
        }
        stage('Deploy') {
            steps {
                sh 'npm run clean'

                script {
                    ENVMAP = [
                        COOKIE_SECRET: UUID.randomUUID(),
                        PORT: "",
                        MONGO: "",
                        REDDIS: ""
                    ]
                    ENVTEXT = ENVMAP.inject([]) { result, entry ->
                        result << "${entry.key}=${entry.value.toString()}"
                    }.join('\n')
                }
                writeFile(file: ".env", text: ENVTEXT, encoding: "UTF-8")

                sshPublisher(
                    publishers: [sshPublisherDesc(
                        configName: 'ubuntu',
                        transfers: [sshTransfer(
                            cleanRemote: true,
                            excludes: '',
                            execCommand: 'touch ./deploy/it-happened.done && du -hd1 ./deploy/cents/',
                            execTimeout: 120000,
                            flatten: false,
                            makeEmptyDirs: true,
                            noDefaultExcludes: false,
                            patternSeparator: '[, ]+',
                            remoteDirectory: '/deploy/cents/',
                            remoteDirectorySDF: false,
                            removePrefix: '',
                            sourceFiles: 'dist/**, node_modules/**, deploy.sh, docker-compose.yml, .env'
                        )], 
                        usePromotionTimestamp: false, 
                        useWorkspaceInPromotion: false,
                        verbose: false
                    )]
                )
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'webpack-stats.json', fingerprint: true
            // archiveArtifacts artifacts: 'node_modules/**, dist/**, server/**, service/**, deploy.sh, docker-compose.yml', fingerprint: true
        }
    }
}
