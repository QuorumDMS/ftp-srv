## v1.0.5-rc.0
1. Fix Compilation Warnings

## v1.0.4

1. Fix the vulnerability: The stream is closed asynchronously. As a result, the socket server is closed when the file is transferred next time.

## v1.0.3

1. Fix the vulnerability: When a large number of files are received, the files are damaged when being flushed to disks.

## v1.0.2

1. Fix the vulnerability: File transfer fails when the port is occupied.

## v1.0.2-rc.0

1. Fix garbled Chinese file names, decode FTP command format, default UTF-8 format
2. When repairing a breakpoint and reconnecting to transfer a file, the file offset is initialized and assigned a value

## v1.0.1

1. Verified on DevEco Studio: NEXT Beta1-5.0.3.806, SDK: API12 Release (5.0.0.66)

## v1.0.0

1. Fix the lack of SIZE command handling in the registry.ts file
2. Modify the STOR command to accept data before asynchronously writing to the file
3. Modify the data message of the STOR command file to be null
4. Remove the copyright header of the open source code for porting and adapting FTP SRV

## v1.0.0-rc.0

1. Transplant and adapt FTP SRV to implement FTP server file transfer protocol