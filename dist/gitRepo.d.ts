import { Directory, File } from "oofs";
import { GitBranch } from "./gitBranch";
import { Url } from "stella";
import { CommitHash } from "./commitHash";
interface IGitLogEntry {
    commitHash: string;
    author: string;
    timestamp: Date;
    message: string;
}
/**
 * Determines whether dir is a directory containing a Git repository.
 * @param dir - The directory to inspect
 * @return A promise for a boolean indicating whether dir contains a Git
 * repository.  This promise will never reject.
 */
export declare function isGitRepoDir(dir: Directory): Promise<boolean>;
export declare class GitRepo {
    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    static fromDirectory(dir: Directory): Promise<GitRepo>;
    /**
     * Clones a Git repo at the specified location.
     * @param src - The source to clone the repo from
     * @param parentDir - The parent directory where the repo will be placed.
     * The repo will be cloned into a subdirectory named after the project.
     * @return A promise for the cloned Git repo.
     */
    static clone(src: Url | Directory, parentDir: Directory): Promise<GitRepo>;
    private _dir;
    private _branches;
    private _log;
    /**
     * Constructs a new GitRepo.  Private in order to provide error checking.
     * See static methods.
     *
     * @param dir - The directory containing the Git repo.
     */
    private constructor();
    /**
     * Gets the directory containing this Git repo.
     * @return The directory containing this git repo.
     */
    readonly directory: Directory;
    /**
     * Determines whether this GitRepo is equal to another GitRepo.  Two
     * instances are considered equal if they point to the same directory.
     * @method
     * @param other - The other GitRepo to compare with
     * @return Whether the two GitRepo instances are equal
     */
    equals(other: GitRepo): boolean;
    /**
     * Gets the files that are under Git version control.
     * @return A Promise for an array of files under Git version control.
     */
    files(): Promise<Array<File>>;
    modifiedFiles(): Promise<Array<File>>;
    untrackedFiles(): Promise<Array<File>>;
    currentCommitHash(): Promise<CommitHash>;
    /**
     * Get the remotes configured for the Git repo.
     * @return A Promise for an object where the remote names are the keys and
     * the remote URL is the value.
     */
    remotes(): Promise<{
        [name: string]: string;
    }>;
    /**
     * Gets the name of this Git repository.  If the repo has a remote, the name
     * is taken from the last part of the remote's URL.  Otherwise, the name
     * will be taken from the "name" property in package.json.  Otherwise, the
     * name will be the name of the folder the repo is in.
     * @return A Promise for the name of this repository.
     */
    name(): Promise<string>;
    tags(): Promise<Array<string>>;
    hasTag(tagName: string): Promise<boolean>;
    createTag(tagName: string, message?: string, force?: boolean): Promise<GitRepo>;
    deleteTag(tagName: string): Promise<GitRepo>;
    pushTag(tagName: string, remoteName: string, force?: boolean): Promise<GitRepo>;
    getBranches(forceUpdate?: boolean): Promise<Array<GitBranch>>;
    getCurrentBranch(): Promise<GitBranch | undefined>;
    checkoutBranch(branch: GitBranch, createIfNonexistent: boolean): Promise<void>;
    checkoutCommit(commit: CommitHash): Promise<void>;
    stageAll(): Promise<GitRepo>;
    pushCurrentBranch(remoteName?: string, setUpstream?: boolean): Promise<void>;
    getCommitDeltas(trackingRemote?: string): Promise<{
        ahead: number;
        behind: number;
    }>;
    commit(msg?: string): Promise<IGitLogEntry>;
    getLog(forceUpdate?: boolean): Promise<Array<IGitLogEntry>>;
    /**
     * Helper method that retrieves Git log entries
     * @private
     * @method
     * @return A promise for an array of structures describing each commit.
     */
    private getLogEntries;
}
export {};
