"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var oofs_1 = require("oofs");
var asynchrony_1 = require("asynchrony");
var gitBranch_1 = require("./gitBranch");
var _ = require("lodash");
var stella_1 = require("stella");
var commitHash_1 = require("./commitHash");
//
// A regex for parsing "git log" output.
// match[1]: commit hash
// match[2]: author
// match[3]: commit timestamp
// match[4]: commit message (a sequence of lines that are either blank or start with whitespace)
//
var GIT_LOG_ENTRY_REGEX = /commit\s*([0-9a-f]+).*?$\s^Author:\s*(.*?)$\s^Date:\s*(.*?)$\s((?:(?:^\s*$\n?)|(?:^\s+(?:.*)$\s?))+)/gm;
/**
 * Determines whether dir is a directory containing a Git repository.
 * @param dir - The directory to inspect
 * @return A promise for a boolean indicating whether dir contains a Git
 * repository.  This promise will never reject.
 */
function isGitRepoDir(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, dirExists, dotGitExists;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        dir.exists(),
                        new oofs_1.Directory(dir, ".git").exists() // The directory contains a .git directory
                    ])];
                case 1:
                    _a = _b.sent(), dirExists = _a[0], dotGitExists = _a[1];
                    return [2 /*return*/, Boolean(dirExists && dotGitExists)];
            }
        });
    });
}
exports.isGitRepoDir = isGitRepoDir;
var GitRepo = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new GitRepo.  Private in order to provide error checking.
     * See static methods.
     *
     * @param dir - The directory containing the Git repo.
     */
    function GitRepo(dir) {
        this._dir = dir;
    }
    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    GitRepo.fromDirectory = function (dir) {
        return __awaiter(this, void 0, void 0, function () {
            var isGitRepo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, isGitRepoDir(dir)];
                    case 1:
                        isGitRepo = _a.sent();
                        if (isGitRepo) {
                            return [2 /*return*/, new GitRepo(dir)];
                        }
                        else {
                            throw new Error("Path does not exist or is not a Git repo.");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clones a Git repo at the specified location.
     * @param src - The source to clone the repo from
     * @param parentDir - The parent directory where the repo will be placed.
     * The repo will be cloned into a subdirectory named after the project.
     * @return A promise for the cloned Git repo.
     */
    GitRepo.clone = function (src, parentDir) {
        var projName;
        var srcStr;
        if (src instanceof stella_1.Url) {
            projName = stella_1.gitUrlToProjectName(src.toString());
            var protocols = src.getProtocols();
            srcStr = protocols.length < 2 ?
                src.toString() :
                src.replaceProtocol("https").toString();
        }
        else {
            projName = src.dirName;
            srcStr = src.toString();
        }
        var repoDir = new oofs_1.Directory(parentDir, projName);
        return parentDir.exists()
            .then(function (parentDirExists) {
            if (!parentDirExists) {
                throw new Error(parentDir + " is not a directory.");
            }
        })
            .then(function () {
            return asynchrony_1.spawn("git", ["clone", srcStr, projName], parentDir.toString())
                .closePromise;
        })
            .then(function () {
            return new GitRepo(repoDir);
        });
    };
    Object.defineProperty(GitRepo.prototype, "directory", {
        /**
         * Gets the directory containing this Git repo.
         * @return The directory containing this git repo.
         */
        get: function () {
            return this._dir;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Determines whether this GitRepo is equal to another GitRepo.  Two
     * instances are considered equal if they point to the same directory.
     * @method
     * @param other - The other GitRepo to compare with
     * @return Whether the two GitRepo instances are equal
     */
    GitRepo.prototype.equals = function (other) {
        return this._dir.equals(other._dir);
    };
    /**
     * Gets the files that are under Git version control.
     * @return A Promise for an array of files under Git version control.
     */
    GitRepo.prototype.files = function () {
        var _this = this;
        return asynchrony_1.spawn("git", ["ls-files"], this._dir.toString())
            .closePromise
            .then(function (stdout) {
            var relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, function (curRelFilePath) {
                return new oofs_1.File(_this._dir, curRelFilePath);
            });
        });
    };
    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    GitRepo.prototype.modifiedFiles = function () {
        var _this = this;
        return asynchrony_1.spawn("git", ["ls-files", "-m"], this._dir.toString())
            .closePromise
            .then(function (stdout) {
            if (stdout === "") {
                return [];
            }
            var relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, function (curRelativeFilePath) {
                return new oofs_1.File(_this._dir, curRelativeFilePath);
            });
        });
    };
    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    GitRepo.prototype.untrackedFiles = function () {
        var _this = this;
        return asynchrony_1.spawn("git", ["ls-files", "--others", "--exclude-standard"], this._dir.toString())
            .closePromise
            .then(function (stdout) {
            if (stdout === "") {
                return [];
            }
            var relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, function (curRelativePath) {
                return new oofs_1.File(_this._dir, curRelativePath);
            });
        });
    };
    // TODO: Write unit tests for this method.  Make sure there is no leading or trailing whitespace.
    GitRepo.prototype.currentCommitHash = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asynchrony_1.spawn("git", ["rev-parse", "--verify", "HEAD"], this._dir.toString()).closePromise];
                    case 1:
                        stdout = _a.sent();
                        hash = commitHash_1.CommitHash.fromString(stdout);
                        if (!hash) {
                            throw new Error("Failed to construct CommitHash.");
                        }
                        return [2 /*return*/, hash];
                }
            });
        });
    };
    /**
     * Get the remotes configured for the Git repo.
     * @return A Promise for an object where the remote names are the keys and
     * the remote URL is the value.
     */
    GitRepo.prototype.remotes = function () {
        return asynchrony_1.spawn("git", ["remote", "-vv"], this._dir.toString())
            .closePromise
            .then(function (stdout) {
            var lines = stdout.split("\n");
            var remotes = {};
            lines.forEach(function (curLine) {
                var match = curLine.match(/^(\w+)\s+(.*)\s+\(\w+\)$/);
                if (match) {
                    remotes[match[1]] = match[2];
                }
            });
            return remotes;
        });
    };
    /**
     * Gets the name of this Git repository.  If the repo has a remote, the name
     * is taken from the last part of the remote's URL.  Otherwise, the name
     * will be taken from the "name" property in package.json.  Otherwise, the
     * name will be the name of the folder the repo is in.
     * @return A Promise for the name of this repository.
     */
    GitRepo.prototype.name = function () {
        var _this = this;
        return this.remotes()
            .then(function (remotes) {
            var remoteNames = Object.keys(remotes);
            if (remoteNames.length > 0) {
                var remoteUrl = remotes[remoteNames[0]];
                return stella_1.gitUrlToProjectName(remoteUrl);
            }
        })
            .then(function (projName) {
            if (projName) {
                return projName;
            }
            // Look for the project name in package.json.
            var packageJson = new oofs_1.File(_this._dir, "package.json").readJsonSync();
            if (packageJson) {
                return packageJson.name;
            }
        })
            .then(function (projName) {
            if (projName) {
                return projName;
            }
            var dirName = _this._dir.dirName;
            if (dirName === "/") {
                throw new Error("Unable to determine Git repo name.");
            }
            return dirName;
        });
    };
    GitRepo.prototype.tags = function () {
        return asynchrony_1.spawn("git", ["tag"], this._dir.toString())
            .closePromise
            .then(function (stdout) {
            if (stdout.length === 0) {
                return [];
            }
            return stdout.split("\n");
        });
    };
    GitRepo.prototype.hasTag = function (tagName) {
        return this.tags()
            .then(function (tags) {
            return tags.indexOf(tagName) >= 0;
        });
    };
    GitRepo.prototype.createTag = function (tagName, message, force) {
        var _this = this;
        if (message === void 0) { message = ""; }
        if (force === void 0) { force = false; }
        var args = ["tag"];
        if (force) {
            args.push("-f");
        }
        args = _.concat(args, "-a", tagName);
        args = _.concat(args, "-m", message);
        return asynchrony_1.spawn("git", args, this._dir.toString())
            .closePromise
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.deleteTag = function (tagName) {
        var _this = this;
        return asynchrony_1.spawn("git", ["tag", "--delete", tagName], this._dir.toString())
            .closePromise
            .catch(function (err) {
            if (err.stderr.includes("not found")) {
                // The specified tag name was not found.  We are still
                // successful.
            }
            else {
                throw err;
            }
        })
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.pushTag = function (tagName, remoteName, force) {
        var _this = this;
        if (force === void 0) { force = false; }
        var args = ["push"];
        if (force) {
            args.push("--force");
        }
        args = _.concat(args, remoteName, tagName);
        return asynchrony_1.spawn("git", args, this._dir.toString())
            .closePromise
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.getBranches = function (forceUpdate) {
        var _this = this;
        if (forceUpdate === void 0) { forceUpdate = false; }
        if (forceUpdate) {
            // Invalidate the cache.  If this update fails, subsequent requests
            // will have to update the cache.
            this._branches = undefined;
        }
        var updatePromise;
        if (this._branches === undefined) {
            // The internal cache of branches needs to be updated.
            updatePromise = gitBranch_1.GitBranch.enumerateGitRepoBranches(this)
                .then(function (branches) {
                _this._branches = branches;
            });
        }
        else {
            // The internal cache does not need to be updated.
            updatePromise = Promise.resolve();
        }
        return updatePromise
            .then(function () {
            // Since updatePromise resolved, we know that this._branches has been
            // set.
            return _this._branches;
        });
    };
    GitRepo.prototype.getCurrentBranch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var branchName, branch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asynchrony_1.spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], this._dir.toString()).closePromise];
                    case 1:
                        branchName = _a.sent();
                        if (branchName === "HEAD") {
                            // The repo is in detached head state.
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, gitBranch_1.GitBranch.create(this, branchName)];
                    case 2:
                        branch = _a.sent();
                        // All is good.
                        return [2 /*return*/, branch];
                }
            });
        });
    };
    GitRepo.prototype.checkoutBranch = function (branch, createIfNonexistent) {
        return __awaiter(this, void 0, void 0, function () {
            var allBranches, args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!createIfNonexistent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getBranches()];
                    case 1:
                        allBranches = _a.sent();
                        if (_.some(allBranches, { name: branch.name })) {
                            createIfNonexistent = false;
                        }
                        _a.label = 2;
                    case 2:
                        args = [
                            "checkout"
                        ].concat((createIfNonexistent ? ["-b"] : []), [
                            branch.name
                        ]);
                        return [4 /*yield*/, asynchrony_1.spawn("git", args, this._dir.toString()).closePromise];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitRepo.prototype.checkoutCommit = function (commit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asynchrony_1.spawn("git", ["checkout", commit.toString()], this._dir.toString()).closePromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitRepo.prototype.stageAll = function () {
        var _this = this;
        return asynchrony_1.spawn("git", ["add", "."], this._dir.toString())
            .closePromise
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.pushCurrentBranch = function (remoteName, setUpstream) {
        if (remoteName === void 0) { remoteName = "origin"; }
        if (setUpstream === void 0) { setUpstream = false; }
        return __awaiter(this, void 0, void 0, function () {
            var curBranch, args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentBranch()];
                    case 1:
                        curBranch = _a.sent();
                        if (!curBranch) {
                            throw new Error("There is no current branch to push.");
                        }
                        args = [
                            "push"
                        ].concat((setUpstream ? ["-u"] : []), [
                            remoteName,
                            curBranch.name
                        ]);
                        return [2 /*return*/, asynchrony_1.spawn("git", args, this._dir.toString())
                                .closePromise
                                .then(function () {
                            })
                                .catch(function (err) {
                                console.log("Error pushing current branch: " + JSON.stringify(err));
                                throw err;
                            })];
                }
            });
        });
    };
    // TODO: Write unit tests for the following method.
    GitRepo.prototype.getCommitDeltas = function (trackingRemote) {
        if (trackingRemote === void 0) { trackingRemote = "origin"; }
        return __awaiter(this, void 0, void 0, function () {
            var branch, thisBranchName, trackingBranchName, numAheadPromise, numBehindPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentBranch()];
                    case 1:
                        branch = _a.sent();
                        if (!branch) {
                            throw new Error("Cannot getNumCommitsAhead() when HEAD is not on a branch.");
                        }
                        thisBranchName = branch.name;
                        trackingBranchName = trackingRemote + "/" + thisBranchName;
                        numAheadPromise = asynchrony_1.spawn("git", ["rev-list", thisBranchName, "--not", trackingBranchName, "--count"], this._dir.toString())
                            .closePromise;
                        numBehindPromise = asynchrony_1.spawn("git", ["rev-list", trackingBranchName, "--not", thisBranchName, "--count"], this._dir.toString())
                            .closePromise;
                        return [2 /*return*/, Promise.all([numAheadPromise, numBehindPromise])
                                .then(function (results) {
                                return {
                                    ahead: parseInt(results[0], 10),
                                    behind: parseInt(results[1], 10)
                                };
                            })];
                }
            });
        });
    };
    // TODO: To get the staged files:
    // git diff --name-only --cached
    // TODO: Add unit tests for this method.
    GitRepo.prototype.commit = function (msg) {
        var _this = this;
        if (msg === void 0) { msg = ""; }
        return asynchrony_1.spawn("git", ["commit", "-m", msg], this._dir.toString())
            .closePromise
            .then(function () {
            // Get the commit hash
            return asynchrony_1.spawn("git", ["rev-parse", "HEAD"], _this._dir.toString()).closePromise;
        })
            .then(function (stdout) {
            var commitHash = _.trim(stdout);
            return asynchrony_1.spawn("git", ["show", commitHash], _this._dir.toString()).closePromise;
        })
            .then(function (stdout) {
            var match = GIT_LOG_ENTRY_REGEX.exec(stdout);
            if (!match) {
                throw new Error("Could not parse \"git show\" output:\n" + stdout);
            }
            return {
                commitHash: match[1],
                author: match[2],
                timestamp: new Date(match[3]),
                message: stella_1.outdent(stella_1.trimBlankLines(match[4]))
            };
        });
    };
    GitRepo.prototype.getLog = function (forceUpdate) {
        var _this = this;
        if (forceUpdate) {
            this._log = undefined;
        }
        var updatePromise;
        if (this._log === undefined) {
            updatePromise = this.getLogEntries()
                .then(function (log) {
                _this._log = log;
            });
        }
        else {
            updatePromise = Promise.resolve();
        }
        return updatePromise
            .then(function () {
            return _this._log;
        });
    };
    /**
     * Helper method that retrieves Git log entries
     * @private
     * @method
     * @return A promise for an array of structures describing each commit.
     */
    GitRepo.prototype.getLogEntries = function () {
        return asynchrony_1.spawn("git", ["log"], this._dir.toString())
            .closePromise
            .then(function (stdout) {
            var entries = [];
            var match;
            while ((match = GIT_LOG_ENTRY_REGEX.exec(stdout)) !== null) // tslint:disable-line
             {
                entries.push({
                    commitHash: match[1],
                    author: match[2],
                    timestamp: new Date(match[3]),
                    message: stella_1.outdent(stella_1.trimBlankLines(match[4]))
                });
            }
            // Git log lists the most recent entry first.  Reverse the array so
            // that the most recent entry is the last.
            _.reverse(entries);
            return entries;
        });
    };
    return GitRepo;
}());
exports.GitRepo = GitRepo;
// TODO: The following will list all tags pointing to the specified commit.
// git tag --points-at 34b8bff

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFZO2FBQ1osSUFBSSxDQUFDLFVBQUMsTUFBTTtZQUNULElBQU0sT0FBTyxHQUF3QixFQUFFLENBQUM7WUFDeEMsSUFBSSxLQUE2QixDQUFDO1lBQ2xDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLHNCQUFzQjthQUNsRjtnQkFDSSxPQUFPLENBQUMsSUFBSSxDQUNSO29CQUNJLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNwQixNQUFNLEVBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDcEIsU0FBUyxFQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUIsT0FBTyxFQUFLLGdCQUFPLENBQUMsdUJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDaEQsQ0FDSixDQUFDO2FBQ0w7WUFFRCxtRUFBbUU7WUFDbkUsMENBQTBDO1lBQzFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkIsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBR0wsY0FBQztBQUFELENBaGxCQSxBQWdsQkMsSUFBQTtBQWhsQlksMEJBQU87QUFrbEJwQiwyRUFBMkU7QUFDM0UsOEJBQThCIiwiZmlsZSI6ImdpdFJlcG8uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdG9yeSwgRmlsZX0gZnJvbSBcIm9vZnNcIjtcbmltcG9ydCB7c3Bhd259IGZyb20gXCJhc3luY2hyb255XCI7XG5pbXBvcnQge0dpdEJyYW5jaH0gZnJvbSBcIi4vZ2l0QnJhbmNoXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7b3V0ZGVudCwgdHJpbUJsYW5rTGluZXMsIFVybCwgZ2l0VXJsVG9Qcm9qZWN0TmFtZSwgSVBhY2thZ2VKc29ufSBmcm9tIFwic3RlbGxhXCI7XG5pbXBvcnQge0NvbW1pdEhhc2h9IGZyb20gXCIuL2NvbW1pdEhhc2hcIjtcblxuXG5pbnRlcmZhY2UgSUdpdExvZ0VudHJ5XG57XG4gICAgLy8gVE9ETzogQ2hhbmdlIHRoZSBmb2xsb3dpbmcgdG8gYW4gaW5zdGFuY2Ugb2YgQ29tbWl0SGFzaC5cbiAgICBjb21taXRIYXNoOiBzdHJpbmc7XG4gICAgYXV0aG9yOiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBEYXRlO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbn1cblxuXG4vL1xuLy8gQSByZWdleCBmb3IgcGFyc2luZyBcImdpdCBsb2dcIiBvdXRwdXQuXG4vLyBtYXRjaFsxXTogY29tbWl0IGhhc2hcbi8vIG1hdGNoWzJdOiBhdXRob3Jcbi8vIG1hdGNoWzNdOiBjb21taXQgdGltZXN0YW1wXG4vLyBtYXRjaFs0XTogY29tbWl0IG1lc3NhZ2UgKGEgc2VxdWVuY2Ugb2YgbGluZXMgdGhhdCBhcmUgZWl0aGVyIGJsYW5rIG9yIHN0YXJ0IHdpdGggd2hpdGVzcGFjZSlcbi8vXG5jb25zdCBHSVRfTE9HX0VOVFJZX1JFR0VYID0gL2NvbW1pdFxccyooWzAtOWEtZl0rKS4qPyRcXHNeQXV0aG9yOlxccyooLio/KSRcXHNeRGF0ZTpcXHMqKC4qPykkXFxzKCg/Oig/Ol5cXHMqJFxcbj8pfCg/Ol5cXHMrKD86LiopJFxccz8pKSspL2dtO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBkaXIgaXMgYSBkaXJlY3RvcnkgY29udGFpbmluZyBhIEdpdCByZXBvc2l0b3J5LlxuICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgdG8gaW5zcGVjdFxuICogQHJldHVybiBBIHByb21pc2UgZm9yIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgZGlyIGNvbnRhaW5zIGEgR2l0XG4gKiByZXBvc2l0b3J5LiAgVGhpcyBwcm9taXNlIHdpbGwgbmV2ZXIgcmVqZWN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNHaXRSZXBvRGlyKGRpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICBjb25zdCBbZGlyRXhpc3RzLCBkb3RHaXRFeGlzdHNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBkaXIuZXhpc3RzKCksICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGRpcmVjdG9yeSBleGlzdHNcbiAgICAgICAgbmV3IERpcmVjdG9yeShkaXIsIFwiLmdpdFwiKS5leGlzdHMoKSAgLy8gVGhlIGRpcmVjdG9yeSBjb250YWlucyBhIC5naXQgZGlyZWN0b3J5XG4gICAgXSk7XG5cbiAgICByZXR1cm4gQm9vbGVhbihkaXJFeGlzdHMgJiYgZG90R2l0RXhpc3RzKTtcbn1cblxuXG5leHBvcnQgY2xhc3MgR2l0UmVwb1xue1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBHaXRSZXBvIGluc3RhbmNlLCBwb2ludGluZyBpdCBhdCBhIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZVxuICAgICAqIHdyYXBwZWQgcmVwby5cbiAgICAgKiBAcGFyYW0gZGlyIC0gVGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSByZXBvXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoZSBHaXRSZXBvLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZnJvbURpcmVjdG9yeShkaXI6IERpcmVjdG9yeSk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIGNvbnN0IGlzR2l0UmVwbyA9IGF3YWl0IGlzR2l0UmVwb0RpcihkaXIpO1xuICAgICAgICBpZiAoaXNHaXRSZXBvKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG8oZGlyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhdGggZG9lcyBub3QgZXhpc3Qgb3IgaXMgbm90IGEgR2l0IHJlcG8uXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDbG9uZXMgYSBHaXQgcmVwbyBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uLlxuICAgICAqIEBwYXJhbSBzcmMgLSBUaGUgc291cmNlIHRvIGNsb25lIHRoZSByZXBvIGZyb21cbiAgICAgKiBAcGFyYW0gcGFyZW50RGlyIC0gVGhlIHBhcmVudCBkaXJlY3Rvcnkgd2hlcmUgdGhlIHJlcG8gd2lsbCBiZSBwbGFjZWQuXG4gICAgICogVGhlIHJlcG8gd2lsbCBiZSBjbG9uZWQgaW50byBhIHN1YmRpcmVjdG9yeSBuYW1lZCBhZnRlciB0aGUgcHJvamVjdC5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgdGhlIGNsb25lZCBHaXQgcmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNsb25lKHNyYzogVXJsIHwgRGlyZWN0b3J5LCBwYXJlbnREaXI6IERpcmVjdG9yeSk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIGxldCBwcm9qTmFtZTogc3RyaW5nO1xuICAgICAgICBsZXQgc3JjU3RyOiBzdHJpbmc7XG5cbiAgICAgICAgaWYgKHNyYyBpbnN0YW5jZW9mIFVybClcbiAgICAgICAge1xuICAgICAgICAgICAgcHJvak5hbWUgPSBnaXRVcmxUb1Byb2plY3ROYW1lKHNyYy50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvY29scyA9IHNyYy5nZXRQcm90b2NvbHMoKTtcbiAgICAgICAgICAgIHNyY1N0ciA9IHByb3RvY29scy5sZW5ndGggPCAyID9cbiAgICAgICAgICAgICAgICBzcmMudG9TdHJpbmcoKSA6XG4gICAgICAgICAgICAgICAgc3JjLnJlcGxhY2VQcm90b2NvbChcImh0dHBzXCIpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBwcm9qTmFtZSA9IHNyYy5kaXJOYW1lO1xuICAgICAgICAgICAgc3JjU3RyID0gc3JjLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBvRGlyID0gbmV3IERpcmVjdG9yeShwYXJlbnREaXIsIHByb2pOYW1lKTtcblxuICAgICAgICByZXR1cm4gcGFyZW50RGlyLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChwYXJlbnREaXJFeGlzdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghcGFyZW50RGlyRXhpc3RzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtwYXJlbnREaXJ9IGlzIG5vdCBhIGRpcmVjdG9yeS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFxuICAgICAgICAgICAgICAgIFwiZ2l0XCIsXG4gICAgICAgICAgICAgICAgW1wiY2xvbmVcIiwgc3JjU3RyLCBwcm9qTmFtZV0sXG4gICAgICAgICAgICAgICAgcGFyZW50RGlyLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAuY2xvc2VQcm9taXNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG8ocmVwb0Rpcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gcmVnaW9uIFByaXZhdGUgRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSBfZGlyOiBEaXJlY3Rvcnk7XG4gICAgcHJpdmF0ZSBfYnJhbmNoZXM6IEFycmF5PEdpdEJyYW5jaD4gfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfbG9nOiBBcnJheTxJR2l0TG9nRW50cnk+IHwgdW5kZWZpbmVkO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IEdpdFJlcG8uICBQcml2YXRlIGluIG9yZGVyIHRvIHByb3ZpZGUgZXJyb3IgY2hlY2tpbmcuXG4gICAgICogU2VlIHN0YXRpYyBtZXRob2RzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgR2l0IHJlcG8uXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihkaXI6IERpcmVjdG9yeSlcbiAgICB7XG4gICAgICAgIHRoaXMuX2RpciA9IGRpcjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoaXMgR2l0IHJlcG8uXG4gICAgICogQHJldHVybiBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhpcyBnaXQgcmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRpcmVjdG9yeSgpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXI7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhpcyBHaXRSZXBvIGlzIGVxdWFsIHRvIGFub3RoZXIgR2l0UmVwby4gIFR3b1xuICAgICAqIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBlcXVhbCBpZiB0aGV5IHBvaW50IHRvIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIG90aGVyIC0gVGhlIG90aGVyIEdpdFJlcG8gdG8gY29tcGFyZSB3aXRoXG4gICAgICogQHJldHVybiBXaGV0aGVyIHRoZSB0d28gR2l0UmVwbyBpbnN0YW5jZXMgYXJlIGVxdWFsXG4gICAgICovXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogR2l0UmVwbyk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXIuZXF1YWxzKG90aGVyLl9kaXIpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZmlsZXMgdGhhdCBhcmUgdW5kZXIgR2l0IHZlcnNpb24gY29udHJvbC5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgZmlsZXMgdW5kZXIgR2l0IHZlcnNpb24gY29udHJvbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZmlsZXMoKTogUHJvbWlzZTxBcnJheTxGaWxlPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJscy1maWxlc1wiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aHMgPSBzdGRvdXQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAocmVsYXRpdmVGaWxlUGF0aHMsIChjdXJSZWxGaWxlUGF0aCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLl9kaXIsIGN1clJlbEZpbGVQYXRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kIGFuZCBtYWtlIHN1cmUgdGhlIGZpbGVzIGhhdmUgdGhlXG4gICAgLy8gY29ycmVjdCBwcmVjZWRpbmcgcGF0aC5cbiAgICBwdWJsaWMgbW9kaWZpZWRGaWxlcygpOiBQcm9taXNlPEFycmF5PEZpbGU+PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImxzLWZpbGVzXCIsIFwiLW1cIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGRvdXQgPT09IFwiXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aHMgPSBzdGRvdXQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAocmVsYXRpdmVGaWxlUGF0aHMsIChjdXJSZWxhdGl2ZUZpbGVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsYXRpdmVGaWxlUGF0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBXcml0ZSB1bml0IHRlc3RzIGZvciB0aGlzIG1ldGhvZCBhbmQgbWFrZSBzdXJlIHRoZSBmaWxlcyBoYXZlIHRoZVxuICAgIC8vIGNvcnJlY3QgcHJlY2VkaW5nIHBhdGguXG4gICAgcHVibGljIHVudHJhY2tlZEZpbGVzKCk6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wibHMtZmlsZXNcIiwgIFwiLS1vdGhlcnNcIiwgIFwiLS1leGNsdWRlLXN0YW5kYXJkXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3Rkb3V0ID09PSBcIlwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlRmlsZVBhdGhzID0gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIF8ubWFwKHJlbGF0aXZlRmlsZVBhdGhzLCAoY3VyUmVsYXRpdmVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kLiAgTWFrZSBzdXJlIHRoZXJlIGlzIG5vIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZS5cbiAgICBwdWJsaWMgYXN5bmMgY3VycmVudENvbW1pdEhhc2goKTogUHJvbWlzZTxDb21taXRIYXNoPlxuICAgIHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gYXdhaXQgc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiLS12ZXJpZnlcIiwgXCJIRUFEXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSkuY2xvc2VQcm9taXNlO1xuICAgICAgICBjb25zdCBoYXNoID0gQ29tbWl0SGFzaC5mcm9tU3RyaW5nKHN0ZG91dCk7XG4gICAgICAgIGlmICghaGFzaClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCBDb21taXRIYXNoLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcmVtb3RlcyBjb25maWd1cmVkIGZvciB0aGUgR2l0IHJlcG8uXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIGFuIG9iamVjdCB3aGVyZSB0aGUgcmVtb3RlIG5hbWVzIGFyZSB0aGUga2V5cyBhbmRcbiAgICAgKiB0aGUgcmVtb3RlIFVSTCBpcyB0aGUgdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIHJlbW90ZXMoKTogUHJvbWlzZTx7W25hbWU6IHN0cmluZ106IHN0cmluZ30+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wicmVtb3RlXCIsIFwiLXZ2XCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVtb3Rlczoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgICAgICAgICBsaW5lcy5mb3JFYWNoKChjdXJMaW5lKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBjdXJMaW5lLm1hdGNoKC9eKFxcdyspXFxzKyguKilcXHMrXFwoXFx3K1xcKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZW1vdGVzW21hdGNoWzFdXSA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVtb3RlcztcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBuYW1lIG9mIHRoaXMgR2l0IHJlcG9zaXRvcnkuICBJZiB0aGUgcmVwbyBoYXMgYSByZW1vdGUsIHRoZSBuYW1lXG4gICAgICogaXMgdGFrZW4gZnJvbSB0aGUgbGFzdCBwYXJ0IG9mIHRoZSByZW1vdGUncyBVUkwuICBPdGhlcndpc2UsIHRoZSBuYW1lXG4gICAgICogd2lsbCBiZSB0YWtlbiBmcm9tIHRoZSBcIm5hbWVcIiBwcm9wZXJ0eSBpbiBwYWNrYWdlLmpzb24uICBPdGhlcndpc2UsIHRoZVxuICAgICAqIG5hbWUgd2lsbCBiZSB0aGUgbmFtZSBvZiB0aGUgZm9sZGVyIHRoZSByZXBvIGlzIGluLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciB0aGUgbmFtZSBvZiB0aGlzIHJlcG9zaXRvcnkuXG4gICAgICovXG4gICAgcHVibGljIG5hbWUoKTogUHJvbWlzZTxzdHJpbmc+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5yZW1vdGVzKClcbiAgICAgICAgLnRoZW4oKHJlbW90ZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbW90ZU5hbWVzID0gT2JqZWN0LmtleXMocmVtb3Rlcyk7XG4gICAgICAgICAgICBpZiAocmVtb3RlTmFtZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZW1vdGVVcmwgPSByZW1vdGVzW3JlbW90ZU5hbWVzWzBdXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2l0VXJsVG9Qcm9qZWN0TmFtZShyZW1vdGVVcmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigocHJvak5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9qTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9qTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTG9vayBmb3IgdGhlIHByb2plY3QgbmFtZSBpbiBwYWNrYWdlLmpzb24uXG4gICAgICAgICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IG5ldyBGaWxlKHRoaXMuX2RpciwgXCJwYWNrYWdlLmpzb25cIikucmVhZEpzb25TeW5jPElQYWNrYWdlSnNvbj4oKTtcbiAgICAgICAgICAgIGlmIChwYWNrYWdlSnNvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYWNrYWdlSnNvbi5uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigocHJvak5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9qTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9qTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZGlyTmFtZSA9IHRoaXMuX2Rpci5kaXJOYW1lO1xuICAgICAgICAgICAgaWYgKGRpck5hbWUgPT09IFwiL1wiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBkZXRlcm1pbmUgR2l0IHJlcG8gbmFtZS5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJOYW1lO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyB0YWdzKCk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJ0YWdcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGRvdXQubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaGFzVGFnKHRhZ05hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhZ3MoKVxuICAgICAgICAudGhlbigodGFncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRhZ3MuaW5kZXhPZih0YWdOYW1lKSA+PSAwO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBjcmVhdGVUYWcodGFnTmFtZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcgPSBcIlwiLCBmb3JjZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgbGV0IGFyZ3MgPSBbXCJ0YWdcIl07XG5cbiAgICAgICAgaWYgKGZvcmNlKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goXCItZlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3MgPSBfLmNvbmNhdChhcmdzLCBcIi1hXCIsIHRhZ05hbWUpO1xuICAgICAgICBhcmdzID0gXy5jb25jYXQoYXJncywgXCItbVwiLCBtZXNzYWdlKTtcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgYXJncywgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGRlbGV0ZVRhZyh0YWdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCIsIFwiLS1kZWxldGVcIiwgdGFnTmFtZV0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyLnN0ZGVyci5pbmNsdWRlcyhcIm5vdCBmb3VuZFwiKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgc3BlY2lmaWVkIHRhZyBuYW1lIHdhcyBub3QgZm91bmQuICBXZSBhcmUgc3RpbGxcbiAgICAgICAgICAgICAgICAvLyBzdWNjZXNzZnVsLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIHB1c2hUYWcodGFnTmFtZTogc3RyaW5nLCByZW1vdGVOYW1lOiBzdHJpbmcsIGZvcmNlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICBsZXQgYXJncyA9IFtcInB1c2hcIl07XG5cbiAgICAgICAgaWYgKGZvcmNlKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goXCItLWZvcmNlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncyA9IF8uY29uY2F0KGFyZ3MsIHJlbW90ZU5hbWUsIHRhZ05hbWUpO1xuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBhcmdzLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0QnJhbmNoZXMoZm9yY2VVcGRhdGU6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8QXJyYXk8R2l0QnJhbmNoPj5cbiAgICB7XG4gICAgICAgIGlmIChmb3JjZVVwZGF0ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gSW52YWxpZGF0ZSB0aGUgY2FjaGUuICBJZiB0aGlzIHVwZGF0ZSBmYWlscywgc3Vic2VxdWVudCByZXF1ZXN0c1xuICAgICAgICAgICAgLy8gd2lsbCBoYXZlIHRvIHVwZGF0ZSB0aGUgY2FjaGUuXG4gICAgICAgICAgICB0aGlzLl9icmFuY2hlcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cGRhdGVQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gICAgICAgIGlmICh0aGlzLl9icmFuY2hlcyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUaGUgaW50ZXJuYWwgY2FjaGUgb2YgYnJhbmNoZXMgbmVlZHMgdG8gYmUgdXBkYXRlZC5cbiAgICAgICAgICAgIHVwZGF0ZVByb21pc2UgPSBHaXRCcmFuY2guZW51bWVyYXRlR2l0UmVwb0JyYW5jaGVzKHRoaXMpXG4gICAgICAgICAgICAudGhlbigoYnJhbmNoZXM6IEFycmF5PEdpdEJyYW5jaD4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9icmFuY2hlcyA9IGJyYW5jaGVzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUaGUgaW50ZXJuYWwgY2FjaGUgZG9lcyBub3QgbmVlZCB0byBiZSB1cGRhdGVkLlxuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVwZGF0ZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gU2luY2UgdXBkYXRlUHJvbWlzZSByZXNvbHZlZCwgd2Uga25vdyB0aGF0IHRoaXMuX2JyYW5jaGVzIGhhcyBiZWVuXG4gICAgICAgICAgICAvLyBzZXQuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYnJhbmNoZXMhO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBhc3luYyBnZXRDdXJyZW50QnJhbmNoKCk6IFByb21pc2U8R2l0QnJhbmNoIHwgdW5kZWZpbmVkPlxuICAgIHtcbiAgICAgICAgLy8gV2hlbiBvbiBtYXN0ZXI6XG4gICAgICAgIC8vIGdpdCBzeW1ib2xpYy1yZWYgSEVBRFxuICAgICAgICAvLyByZWZzL2hlYWRzL21hc3RlclxuXG4gICAgICAgIC8vIFdoZW4gaW4gZGV0YWNoZWQgaGVhZCBzdGF0ZTpcbiAgICAgICAgLy8gZ2l0IHN5bWJvbGljLXJlZiBIRUFEXG4gICAgICAgIC8vIGZhdGFsOiByZWYgSEVBRCBpcyBub3QgYSBzeW1ib2xpYyByZWZcblxuICAgICAgICAvLyBUaGUgYmVsb3cgY29tbWFuZCB3aGVuIGluIGRldGFjaGVkIEhFQUQgc3RhdGVcbiAgICAgICAgLy8gJCBnaXQgcmV2LXBhcnNlIC0tYWJicmV2LXJlZiBIRUFEXG4gICAgICAgIC8vIEhFQURcblxuICAgICAgICBjb25zdCBicmFuY2hOYW1lID0gYXdhaXQgc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiLS1hYmJyZXYtcmVmXCIsIFwiSEVBRFwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpLmNsb3NlUHJvbWlzZTtcbiAgICAgICAgaWYgKGJyYW5jaE5hbWUgPT09IFwiSEVBRFwiKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUaGUgcmVwbyBpcyBpbiBkZXRhY2hlZCBoZWFkIHN0YXRlLlxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJyYW5jaCA9IGF3YWl0IEdpdEJyYW5jaC5jcmVhdGUodGhpcywgYnJhbmNoTmFtZSk7XG5cbiAgICAgICAgLy8gQWxsIGlzIGdvb2QuXG4gICAgICAgIHJldHVybiBicmFuY2g7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYXN5bmMgY2hlY2tvdXRCcmFuY2goYnJhbmNoOiBHaXRCcmFuY2gsIGNyZWF0ZUlmTm9uZXhpc3RlbnQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICBpZiAoY3JlYXRlSWZOb25leGlzdGVudClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBicmFuY2ggd2l0aCB0aGUgc2FtZSBuYW1lLCB3ZSBzaG91bGQgbm90IHRyeSB0b1xuICAgICAgICAgICAgLy8gY3JlYXRlIGl0LiAgSW5zdGVhZCwgd2Ugc2hvdWxkIGp1c3QgY2hlY2sgaXQgb3V0LlxuICAgICAgICAgICAgY29uc3QgYWxsQnJhbmNoZXMgPSBhd2FpdCB0aGlzLmdldEJyYW5jaGVzKCk7XG4gICAgICAgICAgICBpZiAoXy5zb21lKGFsbEJyYW5jaGVzLCB7bmFtZTogYnJhbmNoLm5hbWV9KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVJZk5vbmV4aXN0ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhcmdzID0gW1xuICAgICAgICAgICAgXCJjaGVja291dFwiLFxuICAgICAgICAgICAgLi4uKGNyZWF0ZUlmTm9uZXhpc3RlbnQgPyBbXCItYlwiXSA6IFtdKSxcbiAgICAgICAgICAgIGJyYW5jaC5uYW1lXG4gICAgICAgIF07XG5cbiAgICAgICAgYXdhaXQgc3Bhd24oXCJnaXRcIiwgYXJncywgdGhpcy5fZGlyLnRvU3RyaW5nKCkpLmNsb3NlUHJvbWlzZTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBhc3luYyBjaGVja291dENvbW1pdChjb21taXQ6IENvbW1pdEhhc2gpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICBhd2FpdCBzcGF3bihcImdpdFwiLCBbXCJjaGVja291dFwiLCBjb21taXQudG9TdHJpbmcoKV0sIHRoaXMuX2Rpci50b1N0cmluZygpKS5jbG9zZVByb21pc2U7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgc3RhZ2VBbGwoKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImFkZFwiLCBcIi5cIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBhc3luYyBwdXNoQ3VycmVudEJyYW5jaChyZW1vdGVOYW1lOiBzdHJpbmcgPSBcIm9yaWdpblwiLCBzZXRVcHN0cmVhbTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgY29uc3QgY3VyQnJhbmNoID0gYXdhaXQgdGhpcy5nZXRDdXJyZW50QnJhbmNoKCk7XG4gICAgICAgIGlmICghY3VyQnJhbmNoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBubyBjdXJyZW50IGJyYW5jaCB0byBwdXNoLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBbXG4gICAgICAgICAgICBcInB1c2hcIixcbiAgICAgICAgICAgIC4uLihzZXRVcHN0cmVhbSA/IFtcIi11XCJdIDogW10pLFxuICAgICAgICAgICAgcmVtb3RlTmFtZSxcbiAgICAgICAgICAgIGN1ckJyYW5jaC5uYW1lXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFcnJvciBwdXNoaW5nIGN1cnJlbnQgYnJhbmNoOiAke0pTT04uc3RyaW5naWZ5KGVycil9YCk7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gVE9ETzogV3JpdGUgdW5pdCB0ZXN0cyBmb3IgdGhlIGZvbGxvd2luZyBtZXRob2QuXG4gICAgcHVibGljIGFzeW5jIGdldENvbW1pdERlbHRhcyh0cmFja2luZ1JlbW90ZTogc3RyaW5nID0gXCJvcmlnaW5cIik6IFByb21pc2U8e2FoZWFkOiBudW1iZXIsIGJlaGluZDogbnVtYmVyfT5cbiAgICB7XG4gICAgICAgIGNvbnN0IGJyYW5jaCA9IGF3YWl0IHRoaXMuZ2V0Q3VycmVudEJyYW5jaCgpO1xuICAgICAgICBpZiAoIWJyYW5jaClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGdldE51bUNvbW1pdHNBaGVhZCgpIHdoZW4gSEVBRCBpcyBub3Qgb24gYSBicmFuY2guXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIG5hbWVzIG9mIHRoZSB0d28gYnJhbmNoZXMgaW4gcXVlc3Rpb24uXG4gICAgICAgIGNvbnN0IHRoaXNCcmFuY2hOYW1lID0gYnJhbmNoLm5hbWU7XG4gICAgICAgIGNvbnN0IHRyYWNraW5nQnJhbmNoTmFtZSA9IGAke3RyYWNraW5nUmVtb3RlfS8ke3RoaXNCcmFuY2hOYW1lfWA7XG5cbiAgICAgICAgY29uc3QgbnVtQWhlYWRQcm9taXNlID0gc3Bhd24oXG4gICAgICAgICAgICBcImdpdFwiLFxuICAgICAgICAgICAgW1wicmV2LWxpc3RcIiwgdGhpc0JyYW5jaE5hbWUsIFwiLS1ub3RcIiwgdHJhY2tpbmdCcmFuY2hOYW1lLCBcIi0tY291bnRcIl0sXG4gICAgICAgICAgICB0aGlzLl9kaXIudG9TdHJpbmcoKVxuICAgICAgICApXG4gICAgICAgIC5jbG9zZVByb21pc2U7XG5cbiAgICAgICAgY29uc3QgbnVtQmVoaW5kUHJvbWlzZSA9IHNwYXduKFxuICAgICAgICAgICAgXCJnaXRcIixcbiAgICAgICAgICAgIFtcInJldi1saXN0XCIsIHRyYWNraW5nQnJhbmNoTmFtZSwgXCItLW5vdFwiLCB0aGlzQnJhbmNoTmFtZSwgXCItLWNvdW50XCJdLFxuICAgICAgICAgICAgdGhpcy5fZGlyLnRvU3RyaW5nKClcbiAgICAgICAgKVxuICAgICAgICAuY2xvc2VQcm9taXNlO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbbnVtQWhlYWRQcm9taXNlLCBudW1CZWhpbmRQcm9taXNlXSlcbiAgICAgICAgLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWhlYWQ6IHBhcnNlSW50KHJlc3VsdHNbMF0sIDEwKSxcbiAgICAgICAgICAgICAgICBiZWhpbmQ6IHBhcnNlSW50KHJlc3VsdHNbMV0sIDEwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBUbyBnZXQgdGhlIHN0YWdlZCBmaWxlczpcbiAgICAvLyBnaXQgZGlmZiAtLW5hbWUtb25seSAtLWNhY2hlZFxuXG5cbiAgICAvLyBUT0RPOiBBZGQgdW5pdCB0ZXN0cyBmb3IgdGhpcyBtZXRob2QuXG4gICAgcHVibGljIGNvbW1pdChtc2c6IHN0cmluZyA9IFwiXCIpOiBQcm9taXNlPElHaXRMb2dFbnRyeT5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJjb21taXRcIiwgXCItbVwiLCBtc2ddLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIGNvbW1pdCBoYXNoXG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiSEVBRFwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpLmNsb3NlUHJvbWlzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tbWl0SGFzaCA9IF8udHJpbShzdGRvdXQpO1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInNob3dcIiwgY29tbWl0SGFzaF0sIHRoaXMuX2Rpci50b1N0cmluZygpKS5jbG9zZVByb21pc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gR0lUX0xPR19FTlRSWV9SRUdFWC5leGVjKHN0ZG91dCk7XG4gICAgICAgICAgICBpZiAoIW1hdGNoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHBhcnNlIFwiZ2l0IHNob3dcIiBvdXRwdXQ6XFxuJHtzdGRvdXR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbW1pdEhhc2g6IG1hdGNoWzFdLFxuICAgICAgICAgICAgICAgIGF1dGhvcjogICAgIG1hdGNoWzJdLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogIG5ldyBEYXRlKG1hdGNoWzNdKSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAgICBvdXRkZW50KHRyaW1CbGFua0xpbmVzKG1hdGNoWzRdKSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldExvZyhmb3JjZVVwZGF0ZT86IGJvb2xlYW4pOiBQcm9taXNlPEFycmF5PElHaXRMb2dFbnRyeT4+XG4gICAge1xuICAgICAgICBpZiAoZm9yY2VVcGRhdGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cGRhdGVQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gICAgICAgIGlmICh0aGlzLl9sb2cgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IHRoaXMuZ2V0TG9nRW50cmllcygpXG4gICAgICAgICAgICAudGhlbigobG9nOiBBcnJheTxJR2l0TG9nRW50cnk+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nID0gbG9nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXBkYXRlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nITtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmV0cmlldmVzIEdpdCBsb2cgZW50cmllc1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZFxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBzdHJ1Y3R1cmVzIGRlc2NyaWJpbmcgZWFjaCBjb21taXQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRMb2dFbnRyaWVzKCk6IFByb21pc2U8QXJyYXk8SUdpdExvZ0VudHJ5Pj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJsb2dcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXM6IEFycmF5PElHaXRMb2dFbnRyeT4gPSBbXTtcbiAgICAgICAgICAgIGxldCBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBHSVRfTE9HX0VOVFJZX1JFR0VYLmV4ZWMoc3Rkb3V0KSkgIT09IG51bGwpIC8vIHRzbGludDpkaXNhYmxlLWxpbmVcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbnRyaWVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1pdEhhc2g6IG1hdGNoWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aG9yOiAgICAgbWF0Y2hbMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6ICBuZXcgRGF0ZShtYXRjaFszXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAgICBvdXRkZW50KHRyaW1CbGFua0xpbmVzKG1hdGNoWzRdKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdpdCBsb2cgbGlzdHMgdGhlIG1vc3QgcmVjZW50IGVudHJ5IGZpcnN0LiAgUmV2ZXJzZSB0aGUgYXJyYXkgc29cbiAgICAgICAgICAgIC8vIHRoYXQgdGhlIG1vc3QgcmVjZW50IGVudHJ5IGlzIHRoZSBsYXN0LlxuICAgICAgICAgICAgXy5yZXZlcnNlKGVudHJpZXMpO1xuICAgICAgICAgICAgcmV0dXJuIGVudHJpZXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG59XG5cbi8vIFRPRE86IFRoZSBmb2xsb3dpbmcgd2lsbCBsaXN0IGFsbCB0YWdzIHBvaW50aW5nIHRvIHRoZSBzcGVjaWZpZWQgY29tbWl0LlxuLy8gZ2l0IHRhZyAtLXBvaW50cy1hdCAzNGI4YmZmXG4iXX0=
