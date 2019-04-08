import {parse, join, relative, isAbsolute} from 'path';
import {promises as fs, constants, Stats} from 'fs';

type Parameters<T> = T extends (... args: infer T) => any ? T : never;
type ReturnType<T> = T extends (... args: any[]) => infer T ? T : never;

export interface NodeFileSystem {
    stat: (...args: Parameters<typeof fs.stat>) => ReturnType<typeof fs.stat>;
    rename: (...args: Parameters<typeof fs.rename>) => ReturnType<typeof fs.rename>;
    access: (...args: Parameters<typeof fs.access>) => ReturnType<typeof fs.access>;
    rmdir: (...args: Parameters<typeof fs.rmdir>) => ReturnType<typeof fs.rmdir>;
    unlink: (...args: Parameters<typeof fs.unlink>) => ReturnType<typeof fs.unlink>;
    mkdir: (...args: Parameters<typeof fs.mkdir>) => ReturnType<typeof fs.mkdir>;
    chmod: (...args: Parameters<typeof fs.chmod>) => ReturnType<typeof fs.chmod>;
    readdir: (...args: Parameters<typeof fs.readdir>) => ReturnType<typeof fs.readdir>;
}

interface FileSystemConfig {
    root: string;
    current: string;
    fs: NodeFileSystem;
}

export class FileSystem {
    private rootDirectory: string;
    private currentDirectory: string;
    private fs: NodeFileSystem;

    /**
   * @param root absolute path on the server to the users root directory
   * @param current relative path from root to the users current directory
   */
    constructor(config: Partial<FileSystemConfig> = {}) {
        this.rootDirectory = config.root || '/';
        this.currentDirectory = config.current || '.';
        this.fs = config.fs || fs as unknown as NodeFileSystem;
    }

    public async absoluteDirectory() {
        return this.getAbsolutePath();
    }

    public async navigate(to: string | null) {
        const directory = this.resolvePath(this.currentDirectory, to);

        await this.fs.access(this.getAbsolutePath(this.rootDirectory, directory), constants.R_OK);

        this.currentDirectory = directory;
        return this.currentDirectory;
    }

    public async stat(path: string | null): Promise<Stats> {
        path = path ? this.resolvePath(this.currentDirectory, path) : this.currentDirectory;
        const stat = await this.fs.stat(this.getAbsolutePath(this.rootDirectory, path));
        return stat;
    }

    public async rename(from: string, to: string): Promise<string> {
        from = this.resolvePath(this.currentDirectory, from);
        to = this.resolvePath(this.currentDirectory, to);
        await this.fs.rename(
            this.getAbsolutePath(this.rootDirectory, from),
            this.getAbsolutePath(this.rootDirectory, to)
        );
        return to;
    }

    public async delete(path: string): Promise<void> {
        path = this.resolvePath(this.currentDirectory, path);
        path = this.getAbsolutePath(this.rootDirectory, path);

        const stat = await this.stat(path);
        if (stat.isDirectory()) await this.fs.rmdir(path);
        else await this.fs.unlink(path);
    }

    public async mkdir(path: string, mode?: string | number): Promise<string> {
        path = this.resolvePath(this.currentDirectory, path);
        await this.fs.mkdir(this.getAbsolutePath(this.rootDirectory, path), mode);
        return path;
    }

    public async chmod(path: string, mode: string | number): Promise<string> {
        path = this.resolvePath(this.currentDirectory, path);
        await this.fs.chmod(this.getAbsolutePath(this.rootDirectory, path), mode);
        return path;
    }

    public async readdir(path: string | null): Promise<string[]> {
        path = this.resolvePath(this.currentDirectory, path);
        const paths = await this.fs.readdir(this.getAbsolutePath(this.rootDirectory, path), {
            encoding: 'utf8'
        });
        return paths as string[];
    }

    // public write(path: string): any;
    // public read(path: string | null): any;

    private resolvePath(from: string, to: string | null) {
        if (!to) return from;
        if (isAbsolute(to)) {
            const {root} = parse(this.rootDirectory);
            const cwd = this.getAbsolutePath(root); // Pretend `cwd` is the absolute path from root
            to = relative(cwd, to);
        }
        return join(from, to);
    }

    private getAbsolutePath(root = this.rootDirectory, current = this.currentDirectory) {
        return join(root, current);
    }
}
