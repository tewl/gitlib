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
var _ = require("lodash");
var asynchrony_1 = require("asynchrony");
var stella_1 = require("stella");
var GitBranch = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new GitBranch.
     *
     * @param repo - The repo the branch should be associated with
     * @param branchName - The branch name
     * @param remoteName - The remote name (if the branch is a remote branch)
     */
    function GitBranch(repo, branchName, remoteName) {
        this._repo = repo;
        this._name = branchName;
        this._remoteName = remoteName || undefined;
    }
    // endregion
    /**
     * Validates the specified branch name
     * @static
     * @method
     * @param branchName - The name to validate
     * @return A promise for a boolean that will indicate whether branchName is
     * valid.  This promise will never reject.
     */
    GitBranch.isValidBranchName = function (branchName) {
        // A Git branch name cannot:
        // - Have a path component that begins with "."
        // - Have a double dot ".."
        // - Have an ASCII control character, "~", "^", ":" or SP, anywhere.
        // - End with a "/"
        // - End with ".lock"
        // - Contain a "\" (backslash)
        //
        // We could check for the above ourselves, or just ask Git to validate
        // branchName using the check-ref-format command.
        // The following command returns 0 if it is a valid name.
        // git check-ref-format --allow-onelevel "foobar\lock"
        // (returns 1 because backslash is invalid)
        return asynchrony_1.spawn("git", ["check-ref-format", "--allow-onelevel", branchName])
            .closePromise
            .then(function () {
            // Exit code === 0 means branchName is valid.
            return true;
        })
            .catch(function () {
            // Exit code !== 0 means branchName is invalid.
            return false;
        });
    };
    /**
     * Creates a GitBranch
     * @static
     * @method
     * @param repo - The repo associated with the branch
     * @param branchName - The name of the branch
     * @param remoteName - The remote name (if a remote branch)
     * @return A Promise for the newly created GitBranch instance.  This Promise
     * will be resolved with undefined if the specified branch name is invalid.
     */
    GitBranch.create = function (repo, branchName, remoteName) {
        return __awaiter(this, void 0, void 0, function () {
            var validator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validator = new stella_1.Validator([this.isValidBranchName]);
                        return [4 /*yield*/, validator.isValid(branchName)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("Cannot create GitBranch instance from invalid branch name " + branchName + ".");
                        }
                        return [2 /*return*/, new GitBranch(repo, branchName, remoteName)];
                }
            });
        });
    };
    /**
     * Enumerates the branches that exist within the specified repo.
     * @static
     * @method
     * @param repo - The repo in which the branches are to be enumerated
     * @return A Promise for an array of branches in the specified repo
     */
    GitBranch.enumerateGitRepoBranches = function (repo) {
        return __awaiter(this, void 0, void 0, function () {
            var stdout;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asynchrony_1.spawn("git", ["branch", "-a"], repo.directory.toString()).closePromise];
                    case 1:
                        stdout = _a.sent();
                        return [2 /*return*/, _.chain(stdout.split("\n"))
                                // Get rid of leading and trailing whitespace
                                .map(function (curLine) { return curLine.trim(); })
                                // Replace the "* " that precedes the current working branch
                                .map(function (curLine) { return curLine.replace(/^\*\s+/, ""); })
                                // Filter out the line that looks like: remotes/origin/HEAD -> origin/master
                                .filter(function (curLine) { return !/^[\w/]+\/HEAD\s+->\s+[\w/]+$/.test(curLine); })
                                // Get rid of leading and trailing whitespace
                                .map(function (curLine) { return curLine.trim(); })
                                // Create an array of GitBranch objects
                                .map(function (longName) {
                                var regexResults = GitBranch.strParserRegex.exec(longName);
                                if (!regexResults) {
                                    throw new Error("Error: Branch \"" + longName + "\" could not be parsed by enumerateGitRepoBranches().");
                                }
                                var remoteName = regexResults[2];
                                var branchName = regexResults[3];
                                // Note: Because the branch names are coming from Git (and not a
                                // user) the branch names do not have to be validated as is done in
                                // GitBranch.create(), which uses user data.
                                return new GitBranch(repo, branchName, remoteName);
                            })
                                .value()];
                }
            });
        });
    };
    Object.defineProperty(GitBranch.prototype, "repo", {
        get: function () {
            return this._repo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GitBranch.prototype, "remoteName", {
        get: function () {
            return this._remoteName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GitBranch.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    // region Static Data Members
    // The regex needed to parse the long name strings printed by "git branch
    // -a".
    // If given remotes/remotename/branch/name
    // group 1: "remotes/remotename"  (not all that useful)
    // group 2: "remotename"          (the remote name)
    // group 3: "branch/name"         (the branch name)
    GitBranch.strParserRegex = /^(remotes\/([\w.-]+)\/)?(.*)$/;
    return GitBranch;
}());
exports.GitBranch = GitBranch;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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O2dDQUNqQyx1Q0FBdUM7aUNBQ3RDLEdBQUcsQ0FBQyxVQUFDLFFBQVE7Z0NBQ1YsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0NBQzdELElBQUksQ0FBQyxZQUFZLEVBQ2pCO29DQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQWtCLFFBQVEsMERBQXNELENBQUMsQ0FBQztpQ0FDckc7Z0NBRUQsSUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUNuQyxJQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBRW5DLGdFQUFnRTtnQ0FDaEUsbUVBQW1FO2dDQUNuRSw0Q0FBNEM7Z0NBRTVDLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQzs0QkFDdkQsQ0FBQyxDQUFDO2lDQUNELEtBQUssRUFBRSxFQUFDOzs7O0tBQ1o7SUF5QkQsc0JBQVcsMkJBQUk7YUFBZjtZQUVJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQUdELHNCQUFXLGlDQUFVO2FBQXJCO1lBRUksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBR0Qsc0JBQVcsMkJBQUk7YUFBZjtZQUVJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQXJKRCw2QkFBNkI7SUFFN0IseUVBQXlFO0lBQ3pFLE9BQU87SUFDUCwwQ0FBMEM7SUFDMUMsdURBQXVEO0lBQ3ZELG1EQUFtRDtJQUNuRCxtREFBbUQ7SUFDcEMsd0JBQWMsR0FBVywrQkFBK0IsQ0FBQztJQStJNUUsZ0JBQUM7Q0F6SkQsQUF5SkMsSUFBQTtBQXpKWSw4QkFBUyIsImZpbGUiOiJnaXRCcmFuY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7R2l0UmVwb30gZnJvbSBcIi4vZ2l0UmVwb1wiO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSBcImFzeW5jaHJvbnlcIjtcbmltcG9ydCB7VmFsaWRhdG9yfSBmcm9tIFwic3RlbGxhXCI7XG5cblxuZXhwb3J0IGNsYXNzIEdpdEJyYW5jaFxue1xuICAgIC8vIHJlZ2lvbiBTdGF0aWMgRGF0YSBNZW1iZXJzXG5cbiAgICAvLyBUaGUgcmVnZXggbmVlZGVkIHRvIHBhcnNlIHRoZSBsb25nIG5hbWUgc3RyaW5ncyBwcmludGVkIGJ5IFwiZ2l0IGJyYW5jaFxuICAgIC8vIC1hXCIuXG4gICAgLy8gSWYgZ2l2ZW4gcmVtb3Rlcy9yZW1vdGVuYW1lL2JyYW5jaC9uYW1lXG4gICAgLy8gZ3JvdXAgMTogXCJyZW1vdGVzL3JlbW90ZW5hbWVcIiAgKG5vdCBhbGwgdGhhdCB1c2VmdWwpXG4gICAgLy8gZ3JvdXAgMjogXCJyZW1vdGVuYW1lXCIgICAgICAgICAgKHRoZSByZW1vdGUgbmFtZSlcbiAgICAvLyBncm91cCAzOiBcImJyYW5jaC9uYW1lXCIgICAgICAgICAodGhlIGJyYW5jaCBuYW1lKVxuICAgIHByaXZhdGUgc3RhdGljIHN0clBhcnNlclJlZ2V4OiBSZWdFeHAgPSAvXihyZW1vdGVzXFwvKFtcXHcuLV0rKVxcLyk/KC4qKSQvO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgbmFtZSB0byB2YWxpZGF0ZVxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhIGJvb2xlYW4gdGhhdCB3aWxsIGluZGljYXRlIHdoZXRoZXIgYnJhbmNoTmFtZSBpc1xuICAgICAqIHZhbGlkLiAgVGhpcyBwcm9taXNlIHdpbGwgbmV2ZXIgcmVqZWN0LlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaXNWYWxpZEJyYW5jaE5hbWUoYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPlxuICAgIHtcbiAgICAgICAgLy8gQSBHaXQgYnJhbmNoIG5hbWUgY2Fubm90OlxuICAgICAgICAvLyAtIEhhdmUgYSBwYXRoIGNvbXBvbmVudCB0aGF0IGJlZ2lucyB3aXRoIFwiLlwiXG4gICAgICAgIC8vIC0gSGF2ZSBhIGRvdWJsZSBkb3QgXCIuLlwiXG4gICAgICAgIC8vIC0gSGF2ZSBhbiBBU0NJSSBjb250cm9sIGNoYXJhY3RlciwgXCJ+XCIsIFwiXlwiLCBcIjpcIiBvciBTUCwgYW55d2hlcmUuXG4gICAgICAgIC8vIC0gRW5kIHdpdGggYSBcIi9cIlxuICAgICAgICAvLyAtIEVuZCB3aXRoIFwiLmxvY2tcIlxuICAgICAgICAvLyAtIENvbnRhaW4gYSBcIlxcXCIgKGJhY2tzbGFzaClcbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgY291bGQgY2hlY2sgZm9yIHRoZSBhYm92ZSBvdXJzZWx2ZXMsIG9yIGp1c3QgYXNrIEdpdCB0byB2YWxpZGF0ZVxuICAgICAgICAvLyBicmFuY2hOYW1lIHVzaW5nIHRoZSBjaGVjay1yZWYtZm9ybWF0IGNvbW1hbmQuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29tbWFuZCByZXR1cm5zIDAgaWYgaXQgaXMgYSB2YWxpZCBuYW1lLlxuICAgICAgICAvLyBnaXQgY2hlY2stcmVmLWZvcm1hdCAtLWFsbG93LW9uZWxldmVsIFwiZm9vYmFyXFxsb2NrXCJcbiAgICAgICAgLy8gKHJldHVybnMgMSBiZWNhdXNlIGJhY2tzbGFzaCBpcyBpbnZhbGlkKVxuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJjaGVjay1yZWYtZm9ybWF0XCIsIFwiLS1hbGxvdy1vbmVsZXZlbFwiLCBicmFuY2hOYW1lXSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBFeGl0IGNvZGUgPT09IDAgbWVhbnMgYnJhbmNoTmFtZSBpcyB2YWxpZC5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgLy8gRXhpdCBjb2RlICE9PSAwIG1lYW5zIGJyYW5jaE5hbWUgaXMgaW52YWxpZC5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgR2l0QnJhbmNoXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIGFzc29jaWF0ZWQgd2l0aCB0aGUgYnJhbmNoXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYnJhbmNoXG4gICAgICogQHBhcmFtIHJlbW90ZU5hbWUgLSBUaGUgcmVtb3RlIG5hbWUgKGlmIGEgcmVtb3RlIGJyYW5jaClcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgR2l0QnJhbmNoIGluc3RhbmNlLiAgVGhpcyBQcm9taXNlXG4gICAgICogd2lsbCBiZSByZXNvbHZlZCB3aXRoIHVuZGVmaW5lZCBpZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGlzIGludmFsaWQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBjcmVhdGUocmVwbzogR2l0UmVwbywgYnJhbmNoTmFtZTogc3RyaW5nLCByZW1vdGVOYW1lPzogc3RyaW5nKTogUHJvbWlzZTxHaXRCcmFuY2g+XG4gICAge1xuICAgICAgICBjb25zdCB2YWxpZGF0b3IgPSBuZXcgVmFsaWRhdG9yPHN0cmluZz4oW3RoaXMuaXNWYWxpZEJyYW5jaE5hbWVdKTtcbiAgICAgICAgaWYgKCEgYXdhaXQgdmFsaWRhdG9yLmlzVmFsaWQoYnJhbmNoTmFtZSkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGNyZWF0ZSBHaXRCcmFuY2ggaW5zdGFuY2UgZnJvbSBpbnZhbGlkIGJyYW5jaCBuYW1lICR7YnJhbmNoTmFtZX0uYCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEdpdEJyYW5jaChyZXBvLCBicmFuY2hOYW1lLCByZW1vdGVOYW1lKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEVudW1lcmF0ZXMgdGhlIGJyYW5jaGVzIHRoYXQgZXhpc3Qgd2l0aGluIHRoZSBzcGVjaWZpZWQgcmVwby5cbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSByZXBvIC0gVGhlIHJlcG8gaW4gd2hpY2ggdGhlIGJyYW5jaGVzIGFyZSB0byBiZSBlbnVtZXJhdGVkXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIGJyYW5jaGVzIGluIHRoZSBzcGVjaWZpZWQgcmVwb1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZW51bWVyYXRlR2l0UmVwb0JyYW5jaGVzKHJlcG86IEdpdFJlcG8pOiBQcm9taXNlPEFycmF5PEdpdEJyYW5jaD4+XG4gICAge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBhd2FpdCBzcGF3bihcImdpdFwiLCBbXCJicmFuY2hcIiwgXCItYVwiXSwgcmVwby5kaXJlY3RvcnkudG9TdHJpbmcoKSkuY2xvc2VQcm9taXNlO1xuXG4gICAgICAgIHJldHVybiBfLmNoYWluKHN0ZG91dC5zcGxpdChcIlxcblwiKSlcbiAgICAgICAgLy8gR2V0IHJpZCBvZiBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gICAgICAgIC5tYXAoKGN1ckxpbmUpID0+IGN1ckxpbmUudHJpbSgpKVxuICAgICAgICAvLyBSZXBsYWNlIHRoZSBcIiogXCIgdGhhdCBwcmVjZWRlcyB0aGUgY3VycmVudCB3b3JraW5nIGJyYW5jaFxuICAgICAgICAubWFwKChjdXJMaW5lKSA9PiBjdXJMaW5lLnJlcGxhY2UoL15cXCpcXHMrLywgXCJcIikpXG4gICAgICAgIC8vIEZpbHRlciBvdXQgdGhlIGxpbmUgdGhhdCBsb29rcyBsaWtlOiByZW1vdGVzL29yaWdpbi9IRUFEIC0+IG9yaWdpbi9tYXN0ZXJcbiAgICAgICAgLmZpbHRlcigoY3VyTGluZSkgPT4gIS9eW1xcdy9dK1xcL0hFQURcXHMrLT5cXHMrW1xcdy9dKyQvLnRlc3QoY3VyTGluZSkpXG4gICAgICAgIC8vIEdldCByaWQgb2YgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgICAubWFwKChjdXJMaW5lKSA9PiBjdXJMaW5lLnRyaW0oKSlcbiAgICAgICAgLy8gQ3JlYXRlIGFuIGFycmF5IG9mIEdpdEJyYW5jaCBvYmplY3RzXG4gICAgICAgIC5tYXAoKGxvbmdOYW1lKTogR2l0QnJhbmNoID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlZ2V4UmVzdWx0cyA9IEdpdEJyYW5jaC5zdHJQYXJzZXJSZWdleC5leGVjKGxvbmdOYW1lKTtcbiAgICAgICAgICAgIGlmICghcmVnZXhSZXN1bHRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3I6IEJyYW5jaCBcIiR7bG9uZ05hbWV9XCIgY291bGQgbm90IGJlIHBhcnNlZCBieSBlbnVtZXJhdGVHaXRSZXBvQnJhbmNoZXMoKS5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVtb3RlTmFtZSA9IHJlZ2V4UmVzdWx0c1syXTtcbiAgICAgICAgICAgIGNvbnN0IGJyYW5jaE5hbWUgPSByZWdleFJlc3VsdHNbM107XG5cbiAgICAgICAgICAgIC8vIE5vdGU6IEJlY2F1c2UgdGhlIGJyYW5jaCBuYW1lcyBhcmUgY29taW5nIGZyb20gR2l0IChhbmQgbm90IGFcbiAgICAgICAgICAgIC8vIHVzZXIpIHRoZSBicmFuY2ggbmFtZXMgZG8gbm90IGhhdmUgdG8gYmUgdmFsaWRhdGVkIGFzIGlzIGRvbmUgaW5cbiAgICAgICAgICAgIC8vIEdpdEJyYW5jaC5jcmVhdGUoKSwgd2hpY2ggdXNlcyB1c2VyIGRhdGEuXG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgR2l0QnJhbmNoKHJlcG8sIGJyYW5jaE5hbWUsIHJlbW90ZU5hbWUpO1xuICAgICAgICB9KVxuICAgICAgICAudmFsdWUoKTtcbiAgICB9XG5cblxuICAgIC8vIHJlZ2lvbiBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIF9yZXBvOiBHaXRSZXBvO1xuICAgIHByaXZhdGUgX3JlbW90ZU5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgR2l0QnJhbmNoLlxuICAgICAqXG4gICAgICogQHBhcmFtIHJlcG8gLSBUaGUgcmVwbyB0aGUgYnJhbmNoIHNob3VsZCBiZSBhc3NvY2lhdGVkIHdpdGhcbiAgICAgKiBAcGFyYW0gYnJhbmNoTmFtZSAtIFRoZSBicmFuY2ggbmFtZVxuICAgICAqIEBwYXJhbSByZW1vdGVOYW1lIC0gVGhlIHJlbW90ZSBuYW1lIChpZiB0aGUgYnJhbmNoIGlzIGEgcmVtb3RlIGJyYW5jaClcbiAgICAgKi9cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKHJlcG86IEdpdFJlcG8sIGJyYW5jaE5hbWU6IHN0cmluZywgcmVtb3RlTmFtZT86IHN0cmluZylcbiAgICB7XG4gICAgICAgIHRoaXMuX3JlcG8gPSByZXBvO1xuICAgICAgICB0aGlzLl9uYW1lID0gYnJhbmNoTmFtZTtcbiAgICAgICAgdGhpcy5fcmVtb3RlTmFtZSA9IHJlbW90ZU5hbWUgfHwgdW5kZWZpbmVkO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCByZXBvKCk6IEdpdFJlcG9cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZXBvO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCByZW1vdGVOYW1lKCk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlbW90ZU5hbWU7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgICB9XG5cbn1cbiJdfQ==
