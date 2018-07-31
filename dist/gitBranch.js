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
        // - Have a double dot "…"
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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O2dDQUNqQyx1Q0FBdUM7aUNBQ3RDLEdBQUcsQ0FBQyxVQUFDLFFBQVE7Z0NBQ1YsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0NBQzdELElBQUksQ0FBQyxZQUFZLEVBQ2pCO29DQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQWtCLFFBQVEsMERBQXNELENBQUMsQ0FBQztpQ0FDckc7Z0NBRUQsSUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUNuQyxJQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBRW5DLGdFQUFnRTtnQ0FDaEUsbUVBQW1FO2dDQUNuRSw0Q0FBNEM7Z0NBRTVDLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQzs0QkFDdkQsQ0FBQyxDQUFDO2lDQUNELEtBQUssRUFBRSxFQUFDOzs7O0tBQ1o7SUF5QkQsc0JBQVcsMkJBQUk7YUFBZjtZQUVJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQUdELHNCQUFXLGlDQUFVO2FBQXJCO1lBRUksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBR0Qsc0JBQVcsMkJBQUk7YUFBZjtZQUVJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQXJKRCw2QkFBNkI7SUFFN0IseUVBQXlFO0lBQ3pFLE9BQU87SUFDUCwwQ0FBMEM7SUFDMUMsdURBQXVEO0lBQ3ZELG1EQUFtRDtJQUNuRCxtREFBbUQ7SUFDcEMsd0JBQWMsR0FBVywrQkFBK0IsQ0FBQztJQStJNUUsZ0JBQUM7Q0F6SkQsQUF5SkMsSUFBQTtBQXpKWSw4QkFBUyIsImZpbGUiOiJnaXRCcmFuY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7R2l0UmVwb30gZnJvbSBcIi4vZ2l0UmVwb1wiO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSBcImFzeW5jaHJvbnlcIjtcbmltcG9ydCB7VmFsaWRhdG9yfSBmcm9tIFwic3RlbGxhXCI7XG5cblxuZXhwb3J0IGNsYXNzIEdpdEJyYW5jaFxue1xuICAgIC8vIHJlZ2lvbiBTdGF0aWMgRGF0YSBNZW1iZXJzXG5cbiAgICAvLyBUaGUgcmVnZXggbmVlZGVkIHRvIHBhcnNlIHRoZSBsb25nIG5hbWUgc3RyaW5ncyBwcmludGVkIGJ5IFwiZ2l0IGJyYW5jaFxuICAgIC8vIC1hXCIuXG4gICAgLy8gSWYgZ2l2ZW4gcmVtb3Rlcy9yZW1vdGVuYW1lL2JyYW5jaC9uYW1lXG4gICAgLy8gZ3JvdXAgMTogXCJyZW1vdGVzL3JlbW90ZW5hbWVcIiAgKG5vdCBhbGwgdGhhdCB1c2VmdWwpXG4gICAgLy8gZ3JvdXAgMjogXCJyZW1vdGVuYW1lXCIgICAgICAgICAgKHRoZSByZW1vdGUgbmFtZSlcbiAgICAvLyBncm91cCAzOiBcImJyYW5jaC9uYW1lXCIgICAgICAgICAodGhlIGJyYW5jaCBuYW1lKVxuICAgIHByaXZhdGUgc3RhdGljIHN0clBhcnNlclJlZ2V4OiBSZWdFeHAgPSAvXihyZW1vdGVzXFwvKFtcXHcuLV0rKVxcLyk/KC4qKSQvO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgbmFtZSB0byB2YWxpZGF0ZVxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhIGJvb2xlYW4gdGhhdCB3aWxsIGluZGljYXRlIHdoZXRoZXIgYnJhbmNoTmFtZSBpc1xuICAgICAqIHZhbGlkLiAgVGhpcyBwcm9taXNlIHdpbGwgbmV2ZXIgcmVqZWN0LlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaXNWYWxpZEJyYW5jaE5hbWUoYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPlxuICAgIHtcbiAgICAgICAgLy8gQSBHaXQgYnJhbmNoIG5hbWUgY2Fubm90OlxuICAgICAgICAvLyAtIEhhdmUgYSBwYXRoIGNvbXBvbmVudCB0aGF0IGJlZ2lucyB3aXRoIFwiLlwiXG4gICAgICAgIC8vIC0gSGF2ZSBhIGRvdWJsZSBkb3QgXCLigKZcIlxuICAgICAgICAvLyAtIEhhdmUgYW4gQVNDSUkgY29udHJvbCBjaGFyYWN0ZXIsIFwiflwiLCBcIl5cIiwgXCI6XCIgb3IgU1AsIGFueXdoZXJlLlxuICAgICAgICAvLyAtIEVuZCB3aXRoIGEgXCIvXCJcbiAgICAgICAgLy8gLSBFbmQgd2l0aCBcIi5sb2NrXCJcbiAgICAgICAgLy8gLSBDb250YWluIGEgXCJcXFwiIChiYWNrc2xhc2gpXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIGNvdWxkIGNoZWNrIGZvciB0aGUgYWJvdmUgb3Vyc2VsdmVzLCBvciBqdXN0IGFzayBHaXQgdG8gdmFsaWRhdGVcbiAgICAgICAgLy8gYnJhbmNoTmFtZSB1c2luZyB0aGUgY2hlY2stcmVmLWZvcm1hdCBjb21tYW5kLlxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvbW1hbmQgcmV0dXJucyAwIGlmIGl0IGlzIGEgdmFsaWQgbmFtZS5cbiAgICAgICAgLy8gZ2l0IGNoZWNrLXJlZi1mb3JtYXQgLS1hbGxvdy1vbmVsZXZlbCBcImZvb2JhclxcbG9ja1wiXG4gICAgICAgIC8vIChyZXR1cm5zIDEgYmVjYXVzZSBiYWNrc2xhc2ggaXMgaW52YWxpZClcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wiY2hlY2stcmVmLWZvcm1hdFwiLCBcIi0tYWxsb3ctb25lbGV2ZWxcIiwgYnJhbmNoTmFtZV0pXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gRXhpdCBjb2RlID09PSAwIG1lYW5zIGJyYW5jaE5hbWUgaXMgdmFsaWQuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEV4aXQgY29kZSAhPT0gMCBtZWFucyBicmFuY2hOYW1lIGlzIGludmFsaWQuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIEdpdEJyYW5jaFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIHJlcG8gLSBUaGUgcmVwbyBhc3NvY2lhdGVkIHdpdGggdGhlIGJyYW5jaFxuICAgICAqIEBwYXJhbSBicmFuY2hOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGJyYW5jaFxuICAgICAqIEBwYXJhbSByZW1vdGVOYW1lIC0gVGhlIHJlbW90ZSBuYW1lIChpZiBhIHJlbW90ZSBicmFuY2gpXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoZSBuZXdseSBjcmVhdGVkIEdpdEJyYW5jaCBpbnN0YW5jZS4gIFRoaXMgUHJvbWlzZVxuICAgICAqIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB1bmRlZmluZWQgaWYgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZSBpcyBpbnZhbGlkLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgY3JlYXRlKHJlcG86IEdpdFJlcG8sIGJyYW5jaE5hbWU6IHN0cmluZywgcmVtb3RlTmFtZT86IHN0cmluZyk6IFByb21pc2U8R2l0QnJhbmNoPlxuICAgIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdG9yID0gbmV3IFZhbGlkYXRvcjxzdHJpbmc+KFt0aGlzLmlzVmFsaWRCcmFuY2hOYW1lXSk7XG4gICAgICAgIGlmICghIGF3YWl0IHZhbGlkYXRvci5pc1ZhbGlkKGJyYW5jaE5hbWUpKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBjcmVhdGUgR2l0QnJhbmNoIGluc3RhbmNlIGZyb20gaW52YWxpZCBicmFuY2ggbmFtZSAke2JyYW5jaE5hbWV9LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBHaXRCcmFuY2gocmVwbywgYnJhbmNoTmFtZSwgcmVtb3RlTmFtZSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBFbnVtZXJhdGVzIHRoZSBicmFuY2hlcyB0aGF0IGV4aXN0IHdpdGhpbiB0aGUgc3BlY2lmaWVkIHJlcG8uXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIGluIHdoaWNoIHRoZSBicmFuY2hlcyBhcmUgdG8gYmUgZW51bWVyYXRlZFxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhbiBhcnJheSBvZiBicmFuY2hlcyBpbiB0aGUgc3BlY2lmaWVkIHJlcG9cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVudW1lcmF0ZUdpdFJlcG9CcmFuY2hlcyhyZXBvOiBHaXRSZXBvKTogUHJvbWlzZTxBcnJheTxHaXRCcmFuY2g+PlxuICAgIHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gYXdhaXQgc3Bhd24oXCJnaXRcIiwgW1wiYnJhbmNoXCIsIFwiLWFcIl0sIHJlcG8uZGlyZWN0b3J5LnRvU3RyaW5nKCkpLmNsb3NlUHJvbWlzZTtcblxuICAgICAgICByZXR1cm4gXy5jaGFpbihzdGRvdXQuc3BsaXQoXCJcXG5cIikpXG4gICAgICAgIC8vIEdldCByaWQgb2YgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgICAubWFwKChjdXJMaW5lKSA9PiBjdXJMaW5lLnRyaW0oKSlcbiAgICAgICAgLy8gUmVwbGFjZSB0aGUgXCIqIFwiIHRoYXQgcHJlY2VkZXMgdGhlIGN1cnJlbnQgd29ya2luZyBicmFuY2hcbiAgICAgICAgLm1hcCgoY3VyTGluZSkgPT4gY3VyTGluZS5yZXBsYWNlKC9eXFwqXFxzKy8sIFwiXCIpKVxuICAgICAgICAvLyBGaWx0ZXIgb3V0IHRoZSBsaW5lIHRoYXQgbG9va3MgbGlrZTogcmVtb3Rlcy9vcmlnaW4vSEVBRCAtPiBvcmlnaW4vbWFzdGVyXG4gICAgICAgIC5maWx0ZXIoKGN1ckxpbmUpID0+ICEvXltcXHcvXStcXC9IRUFEXFxzKy0+XFxzK1tcXHcvXSskLy50ZXN0KGN1ckxpbmUpKVxuICAgICAgICAvLyBHZXQgcmlkIG9mIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgICAgLm1hcCgoY3VyTGluZSkgPT4gY3VyTGluZS50cmltKCkpXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBHaXRCcmFuY2ggb2JqZWN0c1xuICAgICAgICAubWFwKChsb25nTmFtZSk6IEdpdEJyYW5jaCA9PiB7XG4gICAgICAgICAgICBjb25zdCByZWdleFJlc3VsdHMgPSBHaXRCcmFuY2guc3RyUGFyc2VyUmVnZXguZXhlYyhsb25nTmFtZSk7XG4gICAgICAgICAgICBpZiAoIXJlZ2V4UmVzdWx0cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yOiBCcmFuY2ggXCIke2xvbmdOYW1lfVwiIGNvdWxkIG5vdCBiZSBwYXJzZWQgYnkgZW51bWVyYXRlR2l0UmVwb0JyYW5jaGVzKCkuYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJlbW90ZU5hbWUgPSByZWdleFJlc3VsdHNbMl07XG4gICAgICAgICAgICBjb25zdCBicmFuY2hOYW1lID0gcmVnZXhSZXN1bHRzWzNdO1xuXG4gICAgICAgICAgICAvLyBOb3RlOiBCZWNhdXNlIHRoZSBicmFuY2ggbmFtZXMgYXJlIGNvbWluZyBmcm9tIEdpdCAoYW5kIG5vdCBhXG4gICAgICAgICAgICAvLyB1c2VyKSB0aGUgYnJhbmNoIG5hbWVzIGRvIG5vdCBoYXZlIHRvIGJlIHZhbGlkYXRlZCBhcyBpcyBkb25lIGluXG4gICAgICAgICAgICAvLyBHaXRCcmFuY2guY3JlYXRlKCksIHdoaWNoIHVzZXMgdXNlciBkYXRhLlxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IEdpdEJyYW5jaChyZXBvLCBicmFuY2hOYW1lLCByZW1vdGVOYW1lKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnZhbHVlKCk7XG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSBfcmVwbzogR2l0UmVwbztcbiAgICBwcml2YXRlIF9yZW1vdGVOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfbmFtZTogc3RyaW5nO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IEdpdEJyYW5jaC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSByZXBvIC0gVGhlIHJlcG8gdGhlIGJyYW5jaCBzaG91bGQgYmUgYXNzb2NpYXRlZCB3aXRoXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgYnJhbmNoIG5hbWVcbiAgICAgKiBAcGFyYW0gcmVtb3RlTmFtZSAtIFRoZSByZW1vdGUgbmFtZSAoaWYgdGhlIGJyYW5jaCBpcyBhIHJlbW90ZSBicmFuY2gpXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihyZXBvOiBHaXRSZXBvLCBicmFuY2hOYW1lOiBzdHJpbmcsIHJlbW90ZU5hbWU/OiBzdHJpbmcpXG4gICAge1xuICAgICAgICB0aGlzLl9yZXBvID0gcmVwbztcbiAgICAgICAgdGhpcy5fbmFtZSA9IGJyYW5jaE5hbWU7XG4gICAgICAgIHRoaXMuX3JlbW90ZU5hbWUgPSByZW1vdGVOYW1lIHx8IHVuZGVmaW5lZDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgcmVwbygpOiBHaXRSZXBvXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVwbztcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgcmVtb3RlTmFtZSgpOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZW1vdGVOYW1lO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBuYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgfVxuXG59XG4iXX0=
