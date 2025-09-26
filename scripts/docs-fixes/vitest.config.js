import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./test/setup.js'],
        include: ['src/**/*.test.js', 'test/**/*-vitest.test.js'],
        exclude: ['node_modules/**', 'dist/**', 'test/**/run-tests.js'],
        timeout: 10000,
        hookTimeout: 10000,
        teardownTimeout: 10000,
        reporter: ['verbose', 'json', 'html'],
        outputFile: {
            json: './test-results/results.json',
            html: './test-results/index.html'
        },
        coverage: {
            include: ['src/**/*.js'],
            exclude: ['src/**/*.test.js', 'src/**/*.spec.js', 'test/**/*.js'],
            reporter: ['text', 'json', 'html'],
            reportOnFailure: true,
            outputDir: './test-results/coverage'
        }
    },
    resolve: {
        alias: {
            '@tests': resolve(__dirname, './test')
        }
    }
})
