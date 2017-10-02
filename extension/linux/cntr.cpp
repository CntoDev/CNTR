#include <string>
#include <fstream>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <vector>
#include <ctime>
#include <mutex>


#define CMD_SEPARATOR "::"
#define ENTRY_SEPARATOR  ","

#define CAPTURE_DIR "Temp"
#define LOG_FILE "logs/cntr.log"
#define INDEX_FILENAME "index.json"


std::mutex mutex;
std::ofstream logStream( LOG_FILE );
std::fstream fileStream;
std::vector<std::string> header;
std::string captureFileName;
std::string captureFilePath;

std::vector<std::string> split( const std::string& input, const std::string& delimiter )
{
    std::vector<std::string> segments;
    size_t delimiterSize = delimiter.size();
    size_t last = 0;
    size_t next = 0;

    while ( ( next = input.find( delimiter, last ) ) != std::string::npos )
    {
        segments.emplace_back( input.substr( last, next - last ) );
        last = next + delimiterSize;
    }
    segments.emplace_back( input.substr( last, next - last ) );

    return segments;
}

std::string createCaptureFilename( const std::string& missionName )
{
    std::stringstream filename;
    std::time_t time = std::time( nullptr );
    std::tm timeStructure = *localtime( &time );
    char buffer[32];
    strftime( buffer, sizeof( buffer ), "__%Y-%m-%d__%H-%M.cntr", &timeStructure );
    filename << missionName << buffer;
    return filename.str();
}

void log( const std::string& message )
{
    std::cerr << message << std::endl;
    logStream << message << std::endl;
}

std::string createIndexEntry(
    const std::string& worldName,
    const std::string& missionName,
    const int& duration,
    const long& date,
    const std::string& captureFilename )
{
    std::stringstream entry;

    entry << "  {" << std::endl
          << "    \"missionName\": \"" << missionName << "\"," << std::endl
          << "    \"worldName\": \"" << worldName << "\"," << std::endl
          << "    \"duration\": " << duration << "," << std::endl
          << "    \"date\": " << date << "," << std::endl
          << "    \"captureFileName\": \"" << captureFilename << "\"" << std::endl
          << "  }";

    return entry.str();
}

int countCaptureLength()
{
    int count = 0;
    std::string line;

    std::ifstream stream( captureFilePath );

    while ( std::getline( stream, line ) )
    {
        ++count;
    }

    return count - 1;
}

void updateIndex( const std::string& exportDir, const std::string& entry )
{
    auto filePath = exportDir + "/" + INDEX_FILENAME;

    fileStream.open( filePath, std::ios_base::in | std::ios_base::out );

    if ( !fileStream.good() || fileStream.peek() == std::ifstream::traits_type::eof() )
    {
        fileStream.close();
        fileStream.open( filePath, std::ios_base::out | std::ios_base::app );
        fileStream << "[" << std::endl << entry << std::endl << "]" << std::endl;
        fileStream.flush();
        fileStream.close();
    }
    else
    {
        std::string content( ( std::istreambuf_iterator<char>( fileStream ) ),
                             ( std::istreambuf_iterator<char>() ) );
        fileStream.flush();
        fileStream.close();

        std::stringstream nextEntry;

        nextEntry << "," << std::endl << entry << std::endl << "]" << std::endl;

        content.replace( content.size() - 3, 3, nextEntry.str() );

        fileStream.open( filePath, std::ios_base::out );
        fileStream << content;
        fileStream.flush();
        fileStream.close();
    }
}

void startCapture( const std::string& captureHeader )
{
    std::lock_guard<std::mutex> lock( mutex );

    header = split( captureHeader, ENTRY_SEPARATOR );
    captureFileName = createCaptureFilename( header [ 1 ] );

    captureFilePath = std::string( CAPTURE_DIR ) + "/" + captureFileName;

    fileStream.open( captureFilePath, std::ios_base::out | std::fstream::app );

    if ( ( fileStream.rdstate() & std::ifstream::failbit ) != 0 )
    {
        log( "CNTR: Error! Cannot open '" + captureFilePath + "'!" );
    }
    else
    {
        fileStream << captureHeader << std::endl;
        fileStream.flush();
    }
}

void appendCaptureData( const std::string& captureData )
{
    std::lock_guard<std::mutex> lock( mutex );

    if ( fileStream.is_open() )
    {
        fileStream << captureData;
        fileStream.flush();
    }
    else
    {
        log( "CNTR: Error! Attempting to write to closed file stream!" );
    }
}

void stopCapture( const std::string& exportDir )
{
    std::lock_guard<std::mutex> lock( mutex );

    if ( fileStream.is_open() )
    {
        fileStream.flush();
        fileStream.close();

        auto captureLength = countCaptureLength();

        std::rename( captureFilePath.c_str(), (exportDir + "/" + captureFileName).c_str() );

        auto missionName = header[ 1 ];
        auto worldName = header[ 2 ];
        auto timestamp = static_cast<long>( std::time( nullptr ) );
        auto indexEntry = createIndexEntry( missionName, worldName, captureLength, timestamp, captureFileName );

        updateIndex( exportDir, indexEntry );
    }
    else
    {
        log( "CNTR: Error! File stream already closed!" );
    }
}

extern "C"
{
    void RVExtension( char* output, int outputSize, const char* function );
}

void RVExtension( char* output, int outputSize, const char* function )
{
    auto splitInput = split( function, CMD_SEPARATOR );

    if ( splitInput[ 0 ] == "start" ) return startCapture( splitInput[ 1 ] );
    if ( splitInput[ 0 ] == "append" ) return appendCaptureData( splitInput[ 1 ] );
    if ( splitInput[ 0 ] == "stop" ) return stopCapture( splitInput[ 1 ] );
}
