/**
 * Custom TTA Reporter for Playwright
 * @author Pramod Dutta
 * @website https://thetestingacademy.com
 * @version 1.0.0
 * @description Custom HTML Reporter for Playwright Test Automation Framework
 */

import {
    FullConfig,
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult,
    TestStep,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

export interface StepData {
    title: string;
    category: string;
    duration: number;
    status: 'passed' | 'failed' | 'skipped';
    screenshot?: string;
    error?: string;
    stackTrace?: string;
    startTime: string;
    consoleLogs?: string[];
    stepIndex?: number;
    videoStartTime?: number;
    videoEndTime?: number;
}

export interface TestData {
    id: string;
    title: string;
    fullTitle: string;
    file: string;
    describePath: string[];
    location: string;
    duration: number;
    status: 'passed' | 'failed' | 'skipped' | 'timedOut';
    retry: number;
    screenshots: { name: string; path: string }[];
    steps: StepData[];
    logs: string[];
    video?: string;
    trace?: string;
    error?: string;
    errorStack?: string;
    tags: string[];
}

interface FileGroup {
    file: string;
    describes: Map<string, TestData[]>;
    stats: { passed: number; failed: number; skipped: number; total: number };
}

export interface SuiteStats {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
}

class CustomTTAReporter implements Reporter {
    private testResults: TestData[] = [];
    private fileGroups: Map<string, FileGroup> = new Map();
    private suiteStats: SuiteStats = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };
    private config?: FullConfig;
    // Meta used by the HTML when there is no Playwright FullConfig (e.g. a
    // Cucumber run feeding the reporter via renderExternalRun).
    private reportMeta?: { browser?: string; workers?: number };
    private startTime: Date = new Date();
    private endTime: Date = new Date();
    private outputFile: string = 'tta-report/index.html';
    private runId: string = '';
    private testStepsMap: Map<string, StepData[]> = new Map();
    private testStartTimeMap: Map<string, number> = new Map();
    private testStepCounterMap: Map<string, number> = new Map();
    private testCounter: number = 0;
    private runningTests: Map<string, TestData> = new Map();
    private completedTestIds: Set<string> = new Set();

    onBegin(config: FullConfig, suite: Suite): void {
        const now = new Date();
        this.runId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        this.outputFile = `tta-report/report_${this.runId}.html`;
        this.config = config;
        this.startTime = new Date();
        const totalTests = suite.allTests().length;

        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║        🎭 ACMEMOVE PLAYWRIGHT AUTOMATION - REAL-TIME REPORT         ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  📅 Started: ${this.startTime.toLocaleString().padEnd(47)}║`);
        console.log(`║  📊 Total Tests: ${String(totalTests).padEnd(44)}║`);
        console.log(`║  🌐 Environment: ${(process.env.TEST_ENV || 'UAT').padEnd(44)}║`);
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        this.initializeLiveReport();
    }

    private initializeLiveReport(): void {
        const reportDir = path.dirname(this.outputFile);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        this.updateReportRealTime();
        console.log(`📡 Real-time report: ${this.outputFile}`);
    }

    onTestBegin(test: TestCase): void {
        this.testStepsMap.set(test.id, []);
        this.testStartTimeMap.set(test.id, Date.now());
        this.testStepCounterMap.set(test.id, 0);
        this.testCounter++;

        const testFile = test.location.file.split('/').pop() || '';
        console.log(`\n▶️  STARTING: ${test.title}`);
        console.log(`   📁 File: ${testFile}`);
        console.log(`   📍 Suite: ${test.parent.title}`);
        console.log('   ─────────────────────────────────────────────────────');

        const describePath: string[] = [];
        let parent: { title: string; parent?: unknown } | undefined = test.parent;
        while (parent && parent.title) {
            describePath.unshift(parent.title);
            parent = parent.parent as { title: string; parent?: unknown } | undefined;
        }

        this.runningTests.set(test.id, {
            id: `running-${test.id}`,
            title: test.title,
            fullTitle: [...describePath, test.title].join(' › '),
            file: test.location.file,
            describePath: describePath,
            location: `${test.location.file}:${test.location.line}`,
            duration: 0,
            status: 'passed',
            retry: 0,
            screenshots: [],
            steps: [],
            logs: [],
            tags: test.tags || [],
        });

        this.updateReportRealTime();
    }

    onStepBegin(_test: TestCase, _result: TestResult, step: TestStep): void {
        if (step.category === 'test.step') {
            console.log(`   ⏳ ${step.title}...`);
        }
    }

    onStepEnd(test: TestCase, _result: TestResult, step: TestStep): void {
        if (step.category === 'test.step') {
            const duration = step.duration ? `(${step.duration}ms)` : '';
            const status = step.error ? '❌' : '✅';
            console.log(`   ${status} ${step.title} ${duration}`);

            const testStartTime = this.testStartTimeMap.get(test.id) || Date.now();
            const stepCounter = this.testStepCounterMap.get(test.id) || 0;
            const testSteps = this.testStepsMap.get(test.id) || [];

            const stepStartTime = new Date(step.startTime).getTime();
            const videoStartTime = stepStartTime - testStartTime;
            const videoEndTime = videoStartTime + (step.duration || 0);

            const stepData: StepData = {
                title: step.title,
                category: step.category,
                duration: step.duration || 0,
                status: step.error ? 'failed' : 'passed',
                startTime: new Date(step.startTime).toLocaleTimeString(),
                error: step.error?.message,
                stackTrace: step.error?.stack,
                consoleLogs: [],
                stepIndex: stepCounter,
                videoStartTime: Math.max(0, videoStartTime),
                videoEndTime: Math.max(0, videoEndTime),
            };
            testSteps.push(stepData);
            this.testStepsMap.set(test.id, testSteps);
            this.testStepCounterMap.set(test.id, stepCounter + 1);

            const runningTest = this.runningTests.get(test.id);
            if (runningTest) {
                runningTest.steps = [...testSteps];
                this.runningTests.set(test.id, runningTest);
            }

            this.updateReportRealTime();
        }
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        this.suiteStats.total++;

        let status: 'passed' | 'failed' | 'skipped' | 'timedOut' = 'passed';
        let statusIcon = '✅';
        if (result.status === 'passed') {
            this.suiteStats.passed++;
            status = 'passed';
            statusIcon = '✅';
        } else if (result.status === 'failed' || result.status === 'timedOut') {
            this.suiteStats.failed++;
            status = result.status === 'timedOut' ? 'timedOut' : 'failed';
            statusIcon = '❌';
        } else {
            this.suiteStats.skipped++;
            status = 'skipped';
            statusIcon = '⏭️';
        }

        const testTime = this.formatDuration(result.duration);

        console.log('   ─────────────────────────────────────────────────────');
        console.log(`   ${statusIcon} RESULT: ${status.toUpperCase()} | Duration: ${testTime}`);
        if (result.error) {
            console.log(`   ⚠️  Error: ${result.error.message?.substring(0, 80)}...`);
        }
        console.log(`\n   📊 Running Total: ✅ ${this.suiteStats.passed} | ❌ ${this.suiteStats.failed} | ⏭️ ${this.suiteStats.skipped}`);

        const currentTestSteps = this.testStepsMap.get(test.id) || [];
        const testLogs = this.collectTestLogs(result);
        this.associateLogsWithSteps(test, result, currentTestSteps, testLogs);

        const screenshots: { name: string; path: string }[] = [];
        const stepScreenshots: Map<string, string> = new Map();
        let videoPath: string | undefined;
        let tracePath: string | undefined;

        for (const attachment of result.attachments) {
            if (attachment.contentType === 'image/png') {
                const screenshotName = `screenshot_${this.testCounter}_${screenshots.length + 1}.png`;
                const destPath = path.join('tta-report', 'screenshots', screenshotName);
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                try {
                    if (attachment.path) {
                        fs.copyFileSync(attachment.path, destPath);
                    } else if (attachment.body) {
                        fs.writeFileSync(destPath, attachment.body);
                    }
                    screenshots.push({ name: attachment.name || `Screenshot ${screenshots.length + 1}`, path: `screenshots/${screenshotName}` });
                    if (attachment.name) {
                        stepScreenshots.set(attachment.name, `screenshots/${screenshotName}`);
                    }
                } catch {
                    console.warn(`Failed to save screenshot: ${attachment.name}`);
                }
            }

            if (attachment.contentType === 'video/webm' && attachment.path) {
                const videoName = `video_${this.testCounter}.webm`;
                const destPath = path.join('tta-report', 'videos', videoName);
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                try {
                    fs.copyFileSync(attachment.path, destPath);
                    videoPath = `videos/${videoName}`;
                } catch {
                    console.warn(`Failed to copy video: ${attachment.path}`);
                }
            }

            if (attachment.name === 'trace' && attachment.path) {
                const traceName = `trace_${this.testCounter}.zip`;
                const destPath = path.join('tta-report', 'traces', traceName);
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                try {
                    fs.copyFileSync(attachment.path, destPath);
                    tracePath = `traces/${traceName}`;
                } catch {
                    console.warn(`Failed to copy trace: ${attachment.path}`);
                }
            }

        }

        // Associate screenshots with steps
        for (const step of currentTestSteps) {
            for (const [name, screenshotPath] of stepScreenshots) {
                const nameLower = name.toLowerCase();
                const titleLower = step.title.toLowerCase();

                const stepIndexPattern = `step-${step.stepIndex}-`;
                if (nameLower.startsWith(stepIndexPattern)) {
                    step.screenshot = screenshotPath;
                    break;
                }

                const stepNumPattern1 = `step_${(step.stepIndex || 0) + 1}_`;
                const stepNumPattern2 = `step ${(step.stepIndex || 0) + 1}`;
                if (nameLower.includes(stepNumPattern1) || nameLower.includes(stepNumPattern2)) {
                    step.screenshot = screenshotPath;
                    break;
                }

                const cleanedName = nameLower.replace(/step[-_]?\d+[-_:]?/i, '').trim();
                if (cleanedName && (titleLower.includes(cleanedName) || cleanedName.includes(titleLower.substring(0, 20)))) {
                    step.screenshot = screenshotPath;
                    break;
                }
            }
        }

        const describePath: string[] = [];
        let parent: Suite | undefined = test.parent;
        while (parent) {
            if (parent.title) {
                describePath.unshift(parent.title);
            }
            parent = parent.parent;
        }

        const tagMatches = test.title.match(/@\w+/g) || [];

        const testData: TestData = {
            id: `test-${test.id}`,
            title: test.title,
            fullTitle: [...describePath, test.title].join(' › '),
            file: test.location.file,
            describePath: describePath,
            location: `${test.location.file.split('/').pop()}:${test.location.line}`,
            duration: result.duration,
            status: status,
            retry: result.retry,
            screenshots: screenshots,
            steps: [...currentTestSteps],
            logs: testLogs,
            video: videoPath,
            trace: tracePath,
            error: result.error?.message,
            errorStack: result.error?.stack,
            tags: tagMatches,
        };

        this.testResults.push(testData);

        const fileName = test.location.file;
        if (!this.fileGroups.has(fileName)) {
            this.fileGroups.set(fileName, {
                file: fileName,
                describes: new Map(),
                stats: { passed: 0, failed: 0, skipped: 0, total: 0 },
            });
        }
        const fileGroup = this.fileGroups.get(fileName)!;
        fileGroup.stats.total++;
        if (status === 'passed') fileGroup.stats.passed++;
        else if (status === 'failed' || status === 'timedOut') fileGroup.stats.failed++;
        else fileGroup.stats.skipped++;

        const describeKey = describePath.join(' › ');
        if (!fileGroup.describes.has(describeKey)) {
            fileGroup.describes.set(describeKey, []);
        }
        fileGroup.describes.get(describeKey)!.push(testData);

        this.runningTests.delete(test.id);
        this.completedTestIds.add(test.id);

        this.updateReportRealTime();
    }

    private updateReportRealTime(): void {
        try {
            const reportDir = path.dirname(this.outputFile);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            const html = this.generateHTMLRealTime();
            fs.writeFileSync(this.outputFile, html);
        } catch (error) {
            console.error('❌ Real-time report update failed:', error);
        }
    }

    private generateHTMLRealTime(): string {
        const inProgressTests = Array.from(this.runningTests.values());
        const originalResults = this.testResults;
        this.testResults = [...originalResults, ...inProgressTests];

        let html = this.generateHTML();

        this.testResults = originalResults;

        html = html.replace(
            '<meta charset="UTF-8">',
            '<meta charset="UTF-8">\n    <meta http-equiv="refresh" content="5">',
        );

        return html;
    }

    async onEnd(_result: FullResult): Promise<void> {
        this.endTime = new Date();
        const duration = this.formatDuration(this.endTime.getTime() - this.startTime.getTime());
        const passRate = this.suiteStats.total > 0
            ? ((this.suiteStats.passed / this.suiteStats.total) * 100).toFixed(1)
            : '0';

        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                    📊 FINAL TEST SUMMARY                        ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  ✅ Passed:  ${String(this.suiteStats.passed).padEnd(49)}║`);
        console.log(`║  ❌ Failed:  ${String(this.suiteStats.failed).padEnd(49)}║`);
        console.log(`║  ⏭️  Skipped: ${String(this.suiteStats.skipped).padEnd(49)}║`);
        console.log(`║  📊 Total:   ${String(this.suiteStats.total).padEnd(49)}║`);
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  ⏱️  Duration: ${duration.padEnd(47)}║`);
        console.log(`║  📈 Pass Rate: ${(passRate + '%').padEnd(47)}║`);
        console.log('╚════════════════════════════════════════════════════════════════╝');

        console.log('\n📊 Generating AcmeMove HTML Report...');
        await this.generateReport();
        console.log(`✅ Report generated: ${this.outputFile}`);
    }

    /**
     * Render a AcmeMove report from an EXTERNAL run that does NOT flow through
     * Playwright's Reporter callbacks (e.g. a Cucumber run via the custom
     * formatter). The caller builds the same TestData[]/SuiteStats model and we
     * reuse the same HTML pipeline as a Playwright run.
     *
     * @returns the path of the generated report file.
     */
    async renderExternalRun(input: {
        runId: string;
        startTime: Date;
        endTime: Date;
        tests: TestData[];
        stats: SuiteStats;
        meta?: { browser?: string; workers?: number };
    }): Promise<string> {
        this.runId = input.runId;
        this.outputFile = `tta-report/report_${input.runId}.html`;
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.testResults = input.tests;
        this.suiteStats = input.stats;
        this.reportMeta = input.meta;

        await this.generateReport();
        return this.outputFile;
    }

    private formatTime(date: Date): string {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    }

    private formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${remainingSeconds}s`;
    }

    private formatVideoTime(ms: number): string {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }

    private collectTestLogs(result: TestResult): string[] {
        const allLogs: string[] = [];

        const appendChunks = (chunks: (string | Buffer)[], prefix = ''): void => {
            for (const chunk of chunks) {
                const text = typeof chunk === 'string' ? chunk : chunk.toString();
                allLogs.push(...text
                    .split('\n')
                    .map(line => this.stripAnsi(line).trim())
                    .filter(Boolean)
                    .map(line => `${prefix}${line}`));
            }
        };

        appendChunks(result.stdout || []);
        appendChunks(result.stderr || [], '[stderr] ');

        return allLogs;
    }

    private stripAnsi(value: string): string {
        const escapeCharacter = String.fromCharCode(27);
        return value.replace(new RegExp(`${escapeCharacter}\\[[0-?]*[ -/]*[@-~]`, 'g'), '');
    }

    private associateLogsWithSteps(_test: TestCase, result: TestResult, testSteps: StepData[], allLogs: string[]): void {
        if (testSteps.length === 0) {
            return;
        }

        // Initialize consoleLogs array for all steps
        for (const step of testSteps) {
            if (!step.consoleLogs) {
                step.consoleLogs = [];
            }
        }

        // Process attachments that might contain step logs
        for (const attachment of result.attachments) {
            const logMatch = attachment.name.match(/^step-(\d+)-logs$/);
            if (logMatch && attachment.contentType === 'text/plain') {
                const stepIndex = parseInt(logMatch[1], 10);
                if (stepIndex >= 0 && stepIndex < testSteps.length) {
                    let logContent = '';
                    if (attachment.body) {
                        logContent = Buffer.isBuffer(attachment.body)
                            ? attachment.body.toString()
                            : String(attachment.body);
                    } else if (attachment.path) {
                        try {
                            logContent = fs.readFileSync(attachment.path, 'utf-8');
                        } catch {
                            // Ignore read errors
                        }
                    }

                    if (logContent) {
                        const logs = logContent.split('\n').filter(line => line.trim());
                        if (logs.length > 0) {
                            testSteps[stepIndex].consoleLogs = logs;
                        }
                    }
                }
            }
        }

        if (allLogs.length === 0) {
            return;
        }

        // IMPORTANT: stdout from test code does NOT include our reporter's ⏳/✅ markers
        // Those go directly to terminal, not into test stdout.
        // So we need to distribute logs among steps based on step count.

        // Strategy: If we have N steps and M logs, try to match logs to steps by:
        // 1. Looking for patterns in the logs that might indicate step boundaries
        // 2. Or distribute evenly if logs appear sequential

        // Build step title patterns for potential matching
        const stepTitlePatterns: RegExp[] = testSteps.map(step => {
            // Create a pattern from the step title (escape special chars)
            const escaped = step.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(escaped, 'i');
        });

        // Track which logs have been assigned
        const assignedLogs: boolean[] = new Array(allLogs.length).fill(false);

        // First pass: Try to match logs to steps by step title content
        for (let logIndex = 0; logIndex < allLogs.length; logIndex++) {
            const log = allLogs[logIndex];

            // Check if this log mentions any step title
            for (let stepIndex = 0; stepIndex < testSteps.length; stepIndex++) {
                if (stepTitlePatterns[stepIndex].test(log)) {
                    testSteps[stepIndex].consoleLogs!.push(log);
                    assignedLogs[logIndex] = true;
                    break;
                }
            }
        }

        // Second pass: Distribute remaining logs sequentially
        // Assume logs appear in the same order as steps execute
        const unassignedLogs = allLogs.filter((_, idx) => !assignedLogs[idx]);

        if (unassignedLogs.length > 0 && testSteps.length > 0) {
            // If we have steps with no logs yet, distribute unassigned logs
            const stepsNeedingLogs = testSteps.filter(s => s.consoleLogs!.length === 0);

            if (stepsNeedingLogs.length > 0) {
                // Distribute logs evenly among steps that need them
                const logsPerStep = Math.ceil(unassignedLogs.length / testSteps.length);
                let logIdx = 0;

                for (let stepIdx = 0; stepIdx < testSteps.length && logIdx < unassignedLogs.length; stepIdx++) {
                    const step = testSteps[stepIdx];
                    // Add logs to this step (either until we hit logsPerStep or run out of logs)
                    const logsForThisStep = Math.min(logsPerStep, unassignedLogs.length - logIdx);

                    // Only add if step doesn't already have logs
                    if (step.consoleLogs!.length === 0) {
                        for (let i = 0; i < logsForThisStep; i++) {
                            step.consoleLogs!.push(unassignedLogs[logIdx++]);
                        }
                    }
                }
            } else {
                // All steps have some logs, add remaining to first step
                testSteps[0].consoleLogs!.push(...unassignedLogs);
            }
        }
    }

    private async generateReport(): Promise<void> {
        const reportDir = path.dirname(this.outputFile);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const html = this.generateHTML();
        fs.writeFileSync(this.outputFile, html);

        const indexPath = path.join(reportDir, 'index.html');
        const latestRedirect = `<!DOCTYPE html>
<html><head><meta http-equiv="refresh" content="0;url=${path.basename(this.outputFile)}">
<title>AcmeMove Report - Latest</title></head>
<body><p>Redirecting to <a href="${path.basename(this.outputFile)}">latest report</a>...</p></body></html>`;
        fs.writeFileSync(indexPath, latestRedirect);

        this.generateHistoryPage(reportDir);
    }

    private generateHistoryPage(reportDir: string): void {
        const files = fs.readdirSync(reportDir)
            .filter(f => f.startsWith('report_') && f.endsWith('.html'))
            .sort()
            .reverse();

        const historyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AcmeMove Report History</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; margin-bottom: 20px; border-radius: 8px; }
        .report-list { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .report-item { padding: 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .report-item:hover { background: #f0fdf4; }
        .report-link { color: #059669; text-decoration: none; font-weight: 500; }
        .report-link:hover { text-decoration: underline; }
        .report-date { color: #666; font-size: 12px; }
        .latest-badge { background: #10b981; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="header"><h1>📊 AcmeMove Report History</h1><p>AcmeMove by Acme - Playwright Framework</p></div>
    <div class="report-list">
        ${files.map((f, i) => {
            const match = f.match(/report_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.html/);
            const dateStr = match ? `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}` : f;
            const latestBadge = i === 0 ? '<span class="latest-badge">LATEST</span>' : '';
            return `<div class="report-item">
                <a href="${f}" class="report-link">${f}${latestBadge}</a>
                <span class="report-date">${dateStr}</span>
            </div>`;
        }).join('\n')}
    </div>
</body>
</html>`;
        fs.writeFileSync(path.join(reportDir, 'history.html'), historyHtml);
    }

    private generateHTML(): string {
        const browserName = this.config?.projects[0]?.name || this.reportMeta?.browser || 'Chromium';
        const platform = process.platform === 'darwin' ? 'Mac' : process.platform === 'win32' ? 'Windows' : 'Linux';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AcmeMove Automation Report</title>
    <style>${this.getStyles()}</style>
</head>
<body>
    <div class="app-shell">
        ${this.generateTopHeader()}
        <div class="content-shell">
            ${this.generateSidebar()}
            <main class="main-content">
                ${this.generateSummaryHeader(browserName, platform)}
                ${this.generateResultToolbar()}
                <div class="results-card">
                    ${this.generateResultList()}
                </div>
            </main>
        </div>
    </div>

    <div id="screenshotModal" class="modal">
        <span class="modal-close">&times;</span>
        <img id="modalImage" class="modal-content" src="" alt="Screenshot">
    </div>

    <script>${this.getScripts()}</script>
</body>
</html>`;
    }

    private generateTopHeader(): string {
        const env = (process.env.TEST_ENV || 'UAT').toUpperCase();
        return `
        <header class="top-header">
            <div class="brand-wrap">
                <div class="brand-icon">J</div>
                <div>
                    <div class="brand-title">AcmeMove Automation Report</div>
                    <div class="brand-subtitle">AcmeMove by Acme · Test Automation Execution Report</div>
                </div>
            </div>
            <div class="header-actions">
                <span class="env-pill">${this.escapeHtml(env)}</span>
                <span class="header-date">${this.formatTime(this.endTime)}</span>
            </div>
        </header>`;
    }

    private generateSidebar(): string {
        const files = Array.from(this.fileGroups.values());
        const failed = this.suiteStats.failed;
        const passed = this.suiteStats.passed;
        const skipped = this.suiteStats.skipped;
        const total = this.suiteStats.total;

        const fileRows = files.map((group) => {
            const fileName = path.basename(group.file);
            const failBadge = group.stats.failed ? `<span class="tree-count fail">${group.stats.failed}</span>` : '';
            const passBadge = group.stats.passed ? `<span class="tree-count pass">${group.stats.passed}</span>` : '';
            const skipBadge = group.stats.skipped ? `<span class="tree-count skip">${group.stats.skipped}</span>` : '';
            return `
                <div class="tree-file" data-file="${this.escapeHtml(group.file)}" onclick="filterByFile(this.dataset.file)">
                    <span class="tree-arrow">›</span>
                    <span class="tree-file-name">${this.escapeHtml(fileName)}</span>
                    <span class="tree-counts">${failBadge}${passBadge}${skipBadge}</span>
                </div>`;
        }).join('');

        return `
        <aside class="sidebar">
            <div class="sidebar-section-title">PROJECT</div>
            <div class="project-root active">
                <span class="project-chevron">⌄</span>
                <span class="project-icon">◉</span>
                <span class="project-name">AcmeMove</span>
                <span class="project-total">${total}</span>
            </div>
            <div class="file-tree">
                ${fileRows || '<div class="empty-tree">No tests executed</div>'}
            </div>

            <div class="sidebar-section-title summary-title">SUMMARY</div>
            <div class="side-stat"><span><i class="dot total"></i>Total</span><b>${total}</b></div>
            <div class="side-stat"><span><i class="dot passed"></i>Passed</span><b>${passed}</b></div>
            <div class="side-stat"><span><i class="dot failed"></i>Failed</span><b>${failed}</b></div>
            <div class="side-stat"><span><i class="dot skipped"></i>Skipped</span><b>${skipped}</b></div>
        </aside>`;
    }

    private generateSummaryHeader(browserName: string, platform: string): string {
        const total = this.suiteStats.total;
        const passRate = total ? ((this.suiteStats.passed / total) * 100).toFixed(2) : '0.00';
        const duration = this.formatDuration(this.endTime.getTime() - this.startTime.getTime());
        const failed = this.suiteStats.failed;
        const passed = this.suiteStats.passed;
        const skipped = this.suiteStats.skipped;
        // Donut represents the complete execution distribution:
        // Passed = green, Failed = red, Skipped = grey.
        // Each segment is sized from the actual test count, not just the pass rate.
        const circumference = 2 * Math.PI * 42;
        const passedSegment = total > 0 ? (passed / total) * circumference : 0;
        const failedSegment = total > 0 ? (failed / total) * circumference : 0;
        const skippedSegment = total > 0 ? (skipped / total) * circumference : 0;
        const failedOffset = -passedSegment;
        const skippedOffset = -(passedSegment + failedSegment);

        return `
        <section class="summary-header">
            <div class="summary-title-row">
                <div>
                    <h1>Test Execution</h1>
                    <p>${this.escapeHtml(process.env.PROJECT_NAME || 'AcmeMove by Acme')}</p>
                </div>
                <div class="run-info">
                    <span>Run ${this.escapeHtml(this.runId)}</span>
                    <span>·</span>
                    <span>${this.formatTime(this.endTime)}</span>
                </div>
            </div>

            <div class="summary-main">
                <div class="summary-numbers">
                    <div class="metric metric-total"><span class="metric-label">Total</span><strong>${total}</strong></div>
                    <div class="metric metric-failed"><span class="metric-label">Failed</span><strong>${failed}</strong></div>
                    <div class="metric metric-passed"><span class="metric-label">Passed</span><strong>${passed}</strong></div>
                    <div class="metric metric-skipped"><span class="metric-label">Skipped</span><strong>${skipped}</strong></div>
                </div>
                <div class="donut-wrap">
                    <svg class="donut" width="112" height="112" viewBox="0 0 112 112" aria-label="Test status distribution">
                        <circle cx="56" cy="56" r="42" class="donut-bg"></circle>
                        ${passedSegment > 0 ? `<circle cx="56" cy="56" r="42" class="donut-segment donut-passed" stroke-dasharray="${passedSegment} ${circumference - passedSegment}" stroke-dashoffset="0"></circle>` : ''}
                        ${failedSegment > 0 ? `<circle cx="56" cy="56" r="42" class="donut-segment donut-failed" stroke-dasharray="${failedSegment} ${circumference - failedSegment}" stroke-dashoffset="${failedOffset}"></circle>` : ''}
                        ${skippedSegment > 0 ? `<circle cx="56" cy="56" r="42" class="donut-segment donut-skipped" stroke-dasharray="${skippedSegment} ${circumference - skippedSegment}" stroke-dashoffset="${skippedOffset}"></circle>` : ''}
                    </svg>
                    <div class="donut-label"><strong>${passRate}%</strong><span>Pass Rate</span></div>
                    <div class="donut-legend">
                        <span><i class="legend-dot passed"></i>${passed} Passed</span>
                        <span><i class="legend-dot failed"></i>${failed} Failed</span>
                        <span><i class="legend-dot skipped"></i>${skipped} Skipped</span>
                    </div>
                </div>
            </div>

            <div class="metadata-row">
                <span><b>Environment</b> ${(process.env.TEST_ENV || 'UAT').toUpperCase()}</span>
                <span><b>Browser</b> ${this.escapeHtml(browserName)}</span>
                <span><b>Platform</b> ${this.escapeHtml(platform)}</span>
                <span><b>Workers</b> ${this.config?.workers ?? this.reportMeta?.workers ?? 1}</span>
                <span><b>Duration</b> ${duration}</span>
                <span><b>Started</b> ${this.formatTime(this.startTime)}</span>
            </div>
        </section>`;
    }

    private generateResultToolbar(): string {
        return `
        <div class="result-toolbar">
            <div class="tabs">
                <button class="tab active" onclick="setView('all', this)">Results <span>${this.suiteStats.total}</span></button>
                <button class="tab" onclick="setView('failed', this)">Failed <span class="red">${this.suiteStats.failed}</span></button>
                <button class="tab" onclick="setView('passed', this)">Passed <span class="green">${this.suiteStats.passed}</span></button>
                <button class="tab" onclick="setView('skipped', this)">Skipped <span class="gray">${this.suiteStats.skipped}</span></button>
            </div>
            <div class="toolbar-right">
                <label class="search-box"><span>⌕</span><input id="testSearch" type="search" placeholder="Search tests" oninput="applyResultFilters()"></label>
                <button class="filter-button" onclick="toggleFilters()">☷ Filters</button>
                <button class="filter-button" onclick="expandAll()">Expand all</button>
            </div>
        </div>
        <div id="filterPanel" class="filter-panel" style="display:none">
            <label><input type="checkbox" class="priority-filter" value="p0"> P0</label>
            <label><input type="checkbox" class="priority-filter" value="p1"> P1</label>
            <label><input type="checkbox" class="priority-filter" value="p2"> P2</label>
            <label><input type="checkbox" class="priority-filter" value="smoke"> Smoke</label>
        </div>`;
    }

    private generateResultList(): string {
        if (this.testResults.length === 0) {
            return '<div class="empty-results">No test results available.</div>';
        }

        return `
        <div class="result-list-header">
            <span>TEST RESULTS</span>
            <span>${this.testResults.length} results</span>
        </div>
        <div id="testList">
            ${this.testResults.map((test, index) => this.generateAllureStyleTestRow(test, index + 1)).join('')}
        </div>`;
    }

    private generateAllureStyleTestRow(test: TestData, serialNo: number): string {
        const statusClass = test.status === 'passed' ? 'passed' : test.status === 'failed' || test.status === 'timedOut' ? 'failed' : 'skipped';
        const statusText = statusClass === 'passed' ? 'Passed' : statusClass === 'failed' ? 'Failed' : 'Skipped';
        const priority = test.tags.find(t => /^@?p[0-2]$/i.test(t))?.replace('@', '').toUpperCase() || '';
        const fileName = path.basename(test.file);
        const detailId = `detail-${test.id}`;
        const tags = test.tags.map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join('');
        const media = [
            test.screenshots.length ? `<a href="${test.screenshots[0].path}" target="_blank" onclick="event.stopPropagation()">Screenshot</a>` : '',
            test.video ? `<a href="${test.video}" target="_blank" onclick="event.stopPropagation()">Video</a>` : '',
            test.trace ? `<a href="${test.trace}" target="_blank" onclick="event.stopPropagation()">Trace</a>` : '',
        ].filter(Boolean).join(' · ') || '—';

        return `
        <div class="test-item ${statusClass}" data-test-id="${test.id}" data-status="${statusClass}" data-file="${this.escapeHtml(test.file)}" data-search="${this.escapeHtml((test.title + ' ' + test.fullTitle + ' ' + fileName + ' ' + test.tags.join(' ')).toLowerCase())}" data-tags="${this.escapeHtml(test.tags.join(' ').toLowerCase())}">
            <div class="test-row-main" onclick="toggleTestDetail('${test.id}')">
                <span class="result-chevron">›</span>
                <span class="status-dot ${statusClass}"></span>
                <div class="test-main-info">
                    <div class="test-title">${this.escapeHtml(test.title)}</div>
                    <div class="test-subtitle">${this.escapeHtml(test.describePath.join(' › ') || fileName)}</div>
                </div>
                <span class="priority-badge ${priority.toLowerCase()}">${priority || '—'}</span>
                <span class="result-duration">${this.formatDuration(test.duration)}</span>
                <span class="result-status ${statusClass}">${statusText}</span>
            </div>
            <div class="test-meta-line">
                <span>${this.escapeHtml(fileName)}:${test.location.split(':').pop()}</span>
                ${tags}
                <span class="meta-spacer"></span>
                <span>${media}</span>
            </div>
            <div class="test-detail-row" id="${detailId}" style="display:none">
                ${this.generateTestDetailPanel(test)}
            </div>
        </div>`;
    }

    private generateSuiteStatus(): string {
        // Combined into meta section - return empty
        return '';
    }

    private generateRunStatus(): string {
        // Combined into meta section - return empty
        return '';
    }

    private generateFilters(): string {
        return `
        <div class="filters">
            <div class="filter-group">
                <strong>🏷️ Priority:</strong>
                <label><input type="checkbox" class="group-filter" value="all" checked onchange="filterByGroup(this)"><span>All</span></label>
                <label><input type="checkbox" class="group-filter" value="p0" onchange="filterByGroup(this)"><span>P0</span></label>
                <label><input type="checkbox" class="group-filter" value="p1" onchange="filterByGroup(this)"><span>P1</span></label>
                <label><input type="checkbox" class="group-filter" value="smoke" onchange="filterByGroup(this)"><span>Smoke</span></label>
            </div>
            <div class="filter-group">
                <strong>📊 Status:</strong>
                <label><input type="checkbox" class="status-filter" value="all" checked onchange="filterByStatus(this)"><span>All</span></label>
                <label><input type="checkbox" class="status-filter" value="passed" onchange="filterByStatus(this)"><span>✅ Passed</span></label>
                <label><input type="checkbox" class="status-filter" value="failed" onchange="filterByStatus(this)"><span>❌ Failed</span></label>
                <label><input type="checkbox" class="status-filter" value="skipped" onchange="filterByStatus(this)"><span>⏭️ Skipped</span></label>
            </div>
        </div>`;
    }

    private generateTestDetailPanel(test: TestData): string {
        let html = '<div class="detail-panel">';

        if (test.error) {
            html += `
            <div class="detail-section error-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Errors
                </div>
                <div class="section-content">
                    <div class="error-box">
                        <pre class="error-message">${this.escapeHtml(test.error)}</pre>
                        ${test.errorStack ? `<details class="stack-details"><summary>Call Stack</summary><pre class="stack-trace-content">${this.escapeHtml(test.errorStack)}</pre></details>` : ''}
                    </div>
                </div>
            </div>`;
        }

        if (test.logs.length > 0) {
            html += `
            <div class="detail-section logs-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Test Logs (${test.logs.length} lines)
                </div>
                <div class="section-content">
                    <div class="step-console-content">`;

            for (const log of test.logs) {
                html += `<div class="console-line">${this.escapeHtml(log)}</div>`;
            }

            html += `
                    </div>
                </div>
            </div>`;
        }

        if (test.steps.length > 0) {
            html += `
            <div class="detail-section steps-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Test Steps
                </div>
                <div class="section-content">
                    <div class="steps-list">`;

            for (let stepIndex = 0; stepIndex < test.steps.length; stepIndex++) {
                const step = test.steps[stepIndex];
                const stepIcon = step.status === 'passed' ? '✓' : '✗';
                const stepClass = step.status;
                const stepId = `step-${test.id}-${stepIndex}`;

                html += `
                    <div class="step-item-container">
                        <div class="step-item ${stepClass} expandable" onclick="toggleStepDetails(this, '${stepId}-details')">
                            <span class="step-expand-icon">▶</span>
                            <span class="step-icon ${stepClass}">${stepIcon}</span>
                            <span class="step-name">${this.escapeHtml(step.title)}</span>
                            <span class="step-time">${this.formatDuration(step.duration)}</span>
                        </div>
                        <div id="${stepId}-details" class="step-details" style="display: none;">
                            <div class="step-meta">
                                <span class="step-meta-item">⏱️ Started: ${step.startTime || 'N/A'}</span>
                                <span class="step-meta-item">⏳ Duration: ${this.formatDuration(step.duration)}</span>
                                <span class="step-meta-item">🎬 Video: ${this.formatVideoTime(step.videoStartTime || 0)} - ${this.formatVideoTime(step.videoEndTime || 0)}</span>
                            </div>`;

                if (step.consoleLogs && step.consoleLogs.length > 0) {
                    html += `
                            <div class="step-console">
                                <div class="step-console-header">📋 Console Output (${step.consoleLogs.length} lines)</div>
                                <div class="step-console-content">`;
                    for (const log of step.consoleLogs) {
                        html += `<div class="console-line">${this.escapeHtml(log)}</div>`;
                    }
                    html += `
                                </div>
                            </div>`;
                }

                if (step.screenshot) {
                    html += `
                            <div class="step-screenshot">
                                <div class="step-screenshot-header">📷 Screenshot</div>
                                <a href="${step.screenshot}" target="_blank">
                                    <img src="${step.screenshot}" alt="Step Screenshot" class="step-screenshot-img"/>
                                </a>
                            </div>`;
                }

                if (step.error) {
                    html += `
                            <div class="step-error">
                                <div class="step-error-header">❌ Error</div>
                                <div class="step-error-message">${this.escapeHtml(step.error)}</div>
                            </div>`;
                    if (step.stackTrace) {
                        html += `
                            <div class="step-stack-trace">
                                <div class="step-stack-header">📜 Stack Trace</div>
                                <pre class="step-stack-content">${this.escapeHtml(step.stackTrace)}</pre>
                            </div>`;
                    }
                }

                html += `
                        </div>
                    </div>`;
            }

            html += `
                    </div>
                </div>
            </div>`;
        }

        if (test.screenshots.length > 0) {
            html += `
            <div class="detail-section screenshots-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Screenshots
                </div>
                <div class="section-content">
                    <div class="screenshots-grid">`;

            for (const screenshot of test.screenshots) {
                html += `
                    <div class="screenshot-item">
                        <a href="${screenshot.path}" target="_blank" class="screenshot-link">
                            <img src="${screenshot.path}" alt="${screenshot.name}" class="screenshot-preview"/>
                        </a>
                        <div class="screenshot-name">📎 ${this.escapeHtml(screenshot.name)}</div>
                    </div>`;
            }

            html += `
                    </div>
                </div>
            </div>`;
        }

        if (test.trace) {
            html += `
            <div class="detail-section traces-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Traces
                </div>
                <div class="section-content">
                    <a href="${test.trace}" download class="trace-download">📁 trace</a>
                </div>
            </div>`;
        }

        if (test.video) {
            html += `
            <div class="detail-section videos-section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span class="section-arrow">▼</span> Videos
                </div>
                <div class="section-content">
                    <video controls class="test-video" src="${test.video}"></video>
                    <div class="video-link"><a href="${test.video}" target="_blank">📎 video</a></div>
                </div>
            </div>`;
        }

        html += '</div>';
        return html;
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    private getStyles(): string {
        return `
        :root {
            --bg: #f7f9fb;
            --surface: #ffffff;
            --border: #e3e8ef;
            --text: #172033;
            --muted: #687386;
            --muted-2: #94a0b3;
            --blue: #4c7dff;
            --blue-soft: #eef3ff;
            --green: #2fc55d;
            --green-soft: #eaf9ef;
            --red: #ff4d4f;
            --red-soft: #fff0f0;
            --gray: #9aa8bc;
            --gray-soft: #f0f3f7;
            --yellow: #f5b942;
        }
        * { box-sizing: border-box; }
        html, body { margin:0; padding:0; background:var(--bg); color:var(--text); font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size:14px; }
        body { min-height:100vh; }
        button, input { font:inherit; }
        a { color:inherit; }
        .app-shell { min-height:100vh; }
        .top-header { height:68px; background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 28px; position:sticky; top:0; z-index:10; }
        .brand-wrap { display:flex; align-items:center; gap:12px; }
        .brand-icon { width:34px; height:34px; border-radius:9px; background:linear-gradient(135deg,#4c7dff,#20c978); color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px; }
        .brand-title { font-weight:700; font-size:16px; }
        .brand-subtitle { color:var(--muted); font-size:11px; margin-top:2px; }
        .header-actions { display:flex; align-items:center; gap:14px; color:var(--muted); font-size:12px; }
        .env-pill { background:var(--blue-soft); color:#416be0; border-radius:14px; padding:5px 10px; font-weight:700; }
        .content-shell { display:flex; min-height:calc(100vh - 68px); }
        .sidebar { width:280px; flex:0 0 280px; background:#fff; border-right:1px solid var(--border); padding:22px 14px; }
        .sidebar-section-title { color:#9aa4b5; font-size:10px; font-weight:800; letter-spacing:1px; padding:0 12px 10px; }
        .project-root, .tree-file { display:flex; align-items:center; min-height:38px; border-radius:7px; padding:0 9px; cursor:pointer; }
        .project-root.active { background:#f1f5ff; color:#315ed6; }
        .project-chevron, .tree-arrow { width:18px; color:#8792a4; }
        .project-icon { margin-right:7px; font-size:12px; }
        .project-name { flex:1; font-weight:650; }
        .project-total { color:var(--muted); font-size:12px; }
        .file-tree { padding:3px 0 14px 14px; }
        .tree-file { gap:3px; color:#495467; }
        .tree-file:hover { background:#f7f9fc; }
        .tree-file-name { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .tree-counts { display:flex; gap:4px; }
        .tree-count { min-width:19px; height:19px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; padding:0 5px; }
        .tree-count.pass { background:#34c759; color:white; }
        .tree-count.fail { background:#ff4548; color:white; }
        .tree-count.skip { background:#a7b5cb; color:white; }
        .summary-title { margin-top:10px; }
        .side-stat { display:flex; justify-content:space-between; padding:7px 12px; color:#5d6879; }
        .side-stat b { color:#273246; }
        .dot { width:8px; height:8px; display:inline-block; border-radius:50%; margin-right:8px; }
        .dot.total { background:#6d7b90; }.dot.passed { background:var(--green); }.dot.failed { background:var(--red); }.dot.skipped { background:var(--gray); }
        .main-content { flex:1; min-width:0; padding:28px 32px 50px; }
        .summary-header { background:#fff; border:1px solid var(--border); border-radius:9px; padding:24px 26px 0; box-shadow:0 1px 2px rgba(20,32,55,.03); }
        .summary-title-row { display:flex; justify-content:space-between; align-items:flex-start; }
        .summary-title-row h1 { margin:0; font-size:22px; letter-spacing:-.2px; }
        .summary-title-row p { margin:5px 0 0; color:var(--muted); }
        .run-info { color:var(--muted); font-size:12px; padding-top:4px; }
        .summary-main { display:flex; align-items:center; justify-content:space-between; padding:25px 0 22px; }
        .summary-numbers { display:flex; align-items:center; gap:42px; }
        .metric { min-width:80px; }.metric-label { display:block; color:var(--muted); font-size:12px; margin-bottom:5px; }.metric strong { font-size:28px; line-height:1; }
        .metric-failed strong { color:var(--red); }.metric-passed strong { color:var(--green); }.metric-skipped strong { color:#8da0bb; }
        .donut-wrap { width:180px; min-height:150px; position:relative; margin-right:10px; display:flex; justify-content:center; align-items:flex-start; }.donut { transform:rotate(-90deg); overflow:visible; }.donut-bg { fill:none; stroke:#edf0f4; stroke-width:9; }.donut-segment { fill:none; stroke-width:9; stroke-linecap:butt; }.donut-passed { stroke:var(--green); }.donut-failed { stroke:var(--red); }.donut-skipped { stroke:#94a3b8; }
        .donut-label { position:absolute; top:34px; left:0; right:0; display:flex; flex-direction:column; justify-content:center; align-items:center; pointer-events:none; }.donut-label strong { font-size:20px; }.donut-label span { color:var(--muted); font-size:10px; margin-top:2px; }
        .donut-legend { position:absolute; top:122px; left:50%; transform:translateX(-50%); display:flex; gap:9px; white-space:nowrap; font-size:9px; color:var(--muted); }.donut-legend span { display:inline-flex; align-items:center; gap:3px; }.legend-dot { width:6px; height:6px; border-radius:50%; display:inline-block; }.legend-dot.passed { background:var(--green); }.legend-dot.failed { background:var(--red); }.legend-dot.skipped { background:#94a3b8; }
        .metadata-row { border-top:1px solid var(--border); display:flex; gap:24px; padding:13px 0; color:var(--muted); font-size:11px; flex-wrap:wrap; }.metadata-row b { color:#465266; margin-right:5px; }
        .result-toolbar { margin-top:22px; display:flex; justify-content:space-between; align-items:center; gap:15px; }
        .tabs { display:flex; align-items:center; gap:3px; }.tab { border:0; background:transparent; padding:10px 13px; color:#687386; cursor:pointer; border-bottom:2px solid transparent; }.tab.active { color:#2f5ed7; border-bottom-color:#4c7dff; font-weight:650; }.tab span { background:#eef1f5; border-radius:10px; padding:2px 7px; font-size:10px; margin-left:4px; }.tab span.red { color:#fff; background:#ff4d4f; }.tab span.green { color:#fff; background:#31c65b; }.tab span.gray { color:#fff; background:#a7b5cb; }
        .toolbar-right { display:flex; gap:8px; align-items:center; }.search-box { height:36px; width:250px; background:#fff; border:1px solid var(--border); border-radius:7px; display:flex; align-items:center; padding:0 10px; color:#8a95a6; }.search-box input { border:0; outline:0; width:100%; padding-left:8px; color:var(--text); }.filter-button { height:36px; border:1px solid var(--border); background:#fff; border-radius:7px; padding:0 12px; color:#596579; cursor:pointer; }.filter-button:hover { background:#f8fafc; }
        .filter-panel { margin-top:8px; background:#fff; border:1px solid var(--border); border-radius:7px; padding:10px 14px; display:flex; gap:18px; color:#5e697a; }.filter-panel label { cursor:pointer; }
        .results-card { margin-top:12px; background:#fff; border:1px solid var(--border); border-radius:9px; overflow:hidden; box-shadow:0 1px 2px rgba(20,32,55,.03); }
        .result-list-header { height:42px; padding:0 16px; display:flex; justify-content:space-between; align-items:center; color:#8a95a6; font-size:10px; font-weight:800; letter-spacing:.8px; background:#f8fafc; border-bottom:1px solid var(--border); }
        .test-item { border-bottom:1px solid #edf0f4; }.test-item:last-child { border-bottom:0; }.test-row-main { min-height:58px; display:flex; align-items:center; gap:12px; padding:0 16px; cursor:pointer; }.test-row-main:hover { background:#fbfcfe; }
        .result-chevron { width:16px; color:#7e899b; font-size:18px; transition:transform .15s; }.test-item.expanded .result-chevron { transform:rotate(90deg); }
        .status-dot { width:10px; height:10px; border-radius:50%; flex:0 0 10px; }.status-dot.passed { background:var(--green); }.status-dot.failed { background:var(--red); }.status-dot.skipped { background:#9eabc0; }
        .test-main-info { min-width:0; flex:1; }.test-title { font-weight:600; color:#273246; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.test-subtitle { color:#8a95a6; font-size:11px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .priority-badge { min-width:34px; text-align:center; font-size:10px; font-weight:700; color:#fff; background:#aab6c8; border-radius:10px; padding:3px 6px; }.priority-badge.p0 { background:#ef4444; }.priority-badge.p1 { background:#f59e0b; }.priority-badge.p2 { background:#7c8aa0; }
        .result-duration { width:58px; text-align:right; color:#748096; font-size:11px; }.result-status { width:65px; text-align:right; font-size:11px; font-weight:700; }.result-status.passed { color:#20a94b; }.result-status.failed { color:#e33f43; }.result-status.skipped { color:#8090a8; }
        .test-meta-line { min-height:34px; padding:0 16px 9px 54px; display:flex; align-items:center; gap:7px; color:#9aa4b3; font-size:10px; }.meta-spacer { flex:1; }.test-meta-line a { color:#4b70d9; text-decoration:none; }.test-meta-line a:hover { text-decoration:underline; }
        .tag { background:#f0f3f7; color:#718096; padding:2px 6px; border-radius:8px; }
        .test-detail-row { background:#fbfcfe; border-top:1px solid #edf0f4; padding:16px 22px 20px 54px; }.detail-panel { background:#fff; border:1px solid var(--border); border-radius:7px; overflow:hidden; }
        .detail-section { border-bottom:1px solid #edf0f4; }.detail-section:last-child { border-bottom:0; }.section-header { padding:10px 13px; font-weight:650; font-size:12px; cursor:pointer; background:#fafbfd; }.section-content { padding:12px; }.error-box { background:#fff5f5; border:1px solid #ffd8d8; border-left:3px solid var(--red); border-radius:5px; padding:10px; }.error-message { white-space:pre-wrap; margin:0; font-size:11px; color:#a22a2d; }
        .stack-details { margin-top:8px; color:#657084; }.stack-trace-content { white-space:pre-wrap; font-size:10px; background:#f7f8fa; padding:8px; border-radius:4px; max-height:260px; overflow:auto; }
        .steps-list { display:flex; flex-direction:column; gap:5px; }.step-item-container { border:1px solid #e8ecf2; border-radius:5px; overflow:hidden; }.step-item { display:flex; align-items:center; gap:8px; padding:8px 10px; cursor:pointer; }.step-item:hover { background:#f8fafc; }.step-icon.passed { color:#25ad4f; }.step-icon.failed { color:#e33f43; }.step-name { flex:1; font-size:11px; }.step-time { color:#8792a4; font-size:10px; }.step-details { padding:9px 11px; background:#fbfcfe; border-top:1px solid #edf0f4; }.step-meta { display:flex; gap:14px; color:#7c8798; font-size:10px; flex-wrap:wrap; }.step-console, .step-screenshot, .step-error, .step-stack-trace { margin-top:10px; }.step-console-header, .step-screenshot-header, .step-error-header, .step-stack-header { font-weight:650; font-size:10px; color:#5e697a; margin-bottom:5px; }.step-console-content { background:#111827; color:#d5dbea; border-radius:5px; padding:8px; font-family:Consolas,monospace; font-size:10px; max-height:180px; overflow:auto; }.console-line { padding:1px 0; }.step-screenshot-img { max-width:420px; max-height:260px; border:1px solid var(--border); border-radius:5px; }.step-error-message { color:#b42327; font-size:11px; }.step-stack-content { white-space:pre-wrap; font-size:10px; background:#f7f8fa; padding:8px; max-height:220px; overflow:auto; }
        .screenshots-grid { display:flex; flex-wrap:wrap; gap:10px; }.screenshot-item { width:180px; }.screenshot-item img { width:180px; height:105px; object-fit:cover; border:1px solid var(--border); border-radius:5px; }.screenshot-name { display:block; font-size:10px; color:#6d7889; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .media-links { display:flex; gap:10px; margin-top:10px; font-size:11px; }.media-links a { color:#416be0; text-decoration:none; }.media-links a:hover { text-decoration:underline; }
        .empty-results, .empty-tree { padding:30px; color:#8a95a6; text-align:center; }
        .modal { display:none; position:fixed; z-index:1000; inset:0; background:rgba(0,0,0,.75); align-items:center; justify-content:center; }.modal.active { display:flex; }.modal-content { max-width:90%; max-height:90%; border-radius:6px; }.modal-close { position:absolute; top:20px; right:30px; color:#fff; font-size:34px; cursor:pointer; }
        @media(max-width:900px) { .sidebar { width:220px; flex-basis:220px; }.main-content { padding:18px; }.summary-numbers { gap:18px; }.toolbar-right { flex-wrap:wrap; }.search-box { width:180px; } }
        @media(max-width:700px) { .content-shell { display:block; }.sidebar { width:100%; border-right:0; border-bottom:1px solid var(--border); }.summary-main { display:block; }.donut-wrap { margin:20px auto 0; }.result-toolbar { display:block; }.toolbar-right { margin-top:10px; }.test-meta-line { padding-left:16px; }.priority-badge,.result-duration { display:none; } }
        `;
    }

    private getScripts(): string {
        return `
        function toggleTestDetail(testId) {
            const item = document.querySelector('.test-item[data-test-id="' + testId + '"]');
            const detail = document.getElementById('detail-' + testId);
            if (!item || !detail) return;
            const hidden = detail.style.display === 'none';
            detail.style.display = hidden ? 'block' : 'none';
            item.classList.toggle('expanded', hidden);
        }

        function setView(view, button) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            if (button) button.classList.add('active');
            document.querySelectorAll('.test-item').forEach(item => {
                const status = item.getAttribute('data-status');
                item.style.display = (view === 'all' || status === view) ? '' : 'none';
            });
            applyResultFilters();
        }

        function filterByFile(file) {
            const search = document.getElementById('testSearch');
            if (search) search.value = '';
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector('.tab')?.classList.add('active');
            document.querySelectorAll('.test-item').forEach(item => {
                item.style.display = item.getAttribute('data-file') === file ? '' : 'none';
            });
        }

        function toggleFilters() {
            const panel = document.getElementById('filterPanel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }

        function applyResultFilters() {
            const query = (document.getElementById('testSearch')?.value || '').toLowerCase().trim();
            const priorities = Array.from(document.querySelectorAll('.priority-filter:checked')).map(x => x.value.toLowerCase());
            document.querySelectorAll('.test-item').forEach(item => {
                const haystack = item.getAttribute('data-search') || '';
                const tags = item.getAttribute('data-tags') || '';
                const queryMatch = !query || haystack.includes(query);
                const priorityMatch = priorities.length === 0 || priorities.some(p => tags.includes(p));
                if (item.style.display !== 'none' || query || priorities.length) {
                    item.style.display = queryMatch && priorityMatch ? '' : 'none';
                }
            });
        }

        function expandAll() {
            document.querySelectorAll('.test-item').forEach(item => {
                const detail = item.querySelector('.test-detail-row');
                if (detail && item.style.display !== 'none') {
                    detail.style.display = 'block';
                    item.classList.add('expanded');
                }
            });
        }

        function toggleSection(header) {
            const section = header.parentElement;
            section.classList.toggle('section-collapsed');
            const content = section.querySelector('.section-content');
            if (content) content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }

        function toggleStepDetails(stepElement, detailsId) {
            const details = document.getElementById(detailsId);
            if (!details) return;
            const hidden = details.style.display === 'none';
            details.style.display = hidden ? 'block' : 'none';
            stepElement.classList.toggle('expanded', hidden);
        }

        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('screenshotModal');
            const modalImg = document.getElementById('modalImage');
            const closeBtn = document.querySelector('.modal-close');

            document.querySelectorAll('.screenshot-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (modal && modalImg) {
                        modal.classList.add('active');
                        modalImg.src = this.href;
                    }
                });
            });

            if (closeBtn) closeBtn.addEventListener('click', () => modal?.classList.remove('active'));
            if (modal) modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
            document.addEventListener('keydown', e => { if (e.key === 'Escape') modal?.classList.remove('active'); });
        });
        `;
    }

}

export default CustomTTAReporter;