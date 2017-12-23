/*
 * OpenCV_ex_08.cpp
 *
 * Load a gray-level image
 *
 * Create and display the image histogram
 *
 * Provide some statistical information
 *
 * TO BE DONE : Subdivide into AUXILIARY FUNCTIONS
 *
 * J. Madeira - Dez 2012 + Nov 2017
 */


 // Visual Studio ONLY - Allowing for pre-compiled header files

 // This has to be the first #include

#include <iostream>


#include "opencv2/core/core.hpp"

#include "opencv2/imgproc/imgproc.hpp"

#include "opencv2/highgui/highgui.hpp"


// If you want to "simplify" code writing, you might want to use:

using namespace cv;
using namespace std;
void identify_ob_by_edges(cv::Mat const &img);
void enchance_ground(cv::Mat const &img, cv::Mat &result);
void cHoughLines(cv::Mat img);

int main( int argc, char** argv )
{
    if( argc != 2)
    {
        cout << "The name of the video file is missing !!" << endl;

        return -1;
    }

	const string videoFilename = argv[1];	
	
	// Open Camera or Video	File
	VideoCapture cap;
    cap.open(videoFilename);


	if (!cap.isOpened())
	{
		cout << "Could not open: " << videoFilename << endl;
		return -1;
	}
	
	const unsigned long int total_frames = cap.get(CAP_PROP_FRAME_COUNT);
	Size videoSize = Size((int)cap.get(CAP_PROP_FRAME_WIDTH), (int)cap.get(CAP_PROP_FRAME_HEIGHT));
	
	  while(1){
 
    Mat frame;
    Mat workingFrame;
    Mat dilationElement;

    // Capture frame-by-frame
    cap >> frame;

    // If the frame is empty, break immediately
    if (frame.empty())
        break;
	int morphSize = 3;

      
	//chance size so windows can be more maneuverable
	resize(frame, frame, Size(640, 480), 0, 0, CV_INTER_LINEAR);

    enchance_ground(frame, workingFrame);
    //cvtColor( workingFrame, workingFrame, cv::COLOR_RGB2GRAY );

    //auto const kernel = cv::getStructuringElement(cv::MORPH_RECT, {3,3});
    //cv::dilate(workingFrame, workingFrame, kernel);


    identify_ob_by_edges(workingFrame);

    cv::imshow("Betther Ground", workingFrame);
    

    //cvtColor(frame, workingFrame, cv::COLOR_RGB2GRAY);
    
    //cHoughLines(workingFrame);

    //lines = cv2.HoughLinesP(edges,1,np.pi/180,40,minLineLength=30,maxLineGap=30)
    //threshold( workingFrame, workingFrame, 180,255,THRESH_BINARY );
    
    //dilationElement = getStructuringElement(MORPH_ELLIPSE, Size(morphSize, morphSize));
    //dilate(workingFrame, workingFrame, dilationElement);
        
    
    
    imshow( "Original", frame );
    //imshow( "Processed", workingFrame );
 
    // Press  ESC on keyboard to exit
    char c=(char)waitKey(25);
    if(c==27)
      break;
  }
  
  // When everything done, release the video capture object
  cap.release();
 
  // Closes all the frames
  destroyAllWindows();
     
  return 0;
}
void cHoughLines(Mat workingFrame){
	Mat cdst;
    Mat cdstP;
  // Edge detection
    Canny(workingFrame, workingFrame, 50, 200, 3);
    // Copy edges to the images that will display the results in BGR
    cvtColor(workingFrame, cdst, COLOR_GRAY2BGR);
    cdstP = cdst.clone();
    // Standard Hough Line Transform
    vector<Vec2f> lines; // will hold the results of the detection
    HoughLines(workingFrame, lines, 1, CV_PI/180, 150, 0, 0 ); // runs the actual detection
    // Draw the lines
    for( size_t i = 0; i < lines.size(); i++ )
    {
        float rho = lines[i][0], theta = lines[i][1];
        Point pt1, pt2;
        double a = cos(theta), b = sin(theta);
        double x0 = a*rho, y0 = b*rho;
        pt1.x = cvRound(x0 + 1000*(-b));
        pt1.y = cvRound(y0 + 1000*(a));
        pt2.x = cvRound(x0 - 1000*(-b));
        pt2.y = cvRound(y0 - 1000*(a));
        line( cdst, pt1, pt2, Scalar(0,0,255), 3, CV_AA);
    }
    // Probabilistic Line Transform
    vector<Vec4i> linesP; // will hold the results of the detection
    HoughLinesP(workingFrame, linesP, 1, CV_PI/180, 50, 50, 10 ); // runs the actual detection
    // Draw the lines
    for( size_t i = 0; i < linesP.size(); i++ )
    {
        Vec4i l = linesP[i];
        line( cdstP, Point(l[0], l[1]), Point(l[2], l[3]), Scalar(0,0,255), 3, LINE_AA);
    }
    
    imshow("Detected Lines (in red) - Standard Hough Line Transform", cdst);
    imshow("Detected Lines (in red) - Probabilistic Line Transform", cdstP);
    
}

void identify_ob_by_edges(cv::Mat const &img)
{
    cv::Mat gray;
    cv::cvtColor(img, gray, CV_BGR2GRAY);
    cv::threshold(gray, gray, 0, 255, cv::THRESH_BINARY | cv::THRESH_OTSU);
    auto const kernel = cv::getStructuringElement(cv::MORPH_RECT, {10,5});
    cv::dilate(gray, gray, kernel);

    std::vector<std::vector<cv::Point>> contours;
    cv::findContours(gray.clone(), contours, cv::RETR_TREE,
                     cv::CHAIN_APPROX_SIMPLE);
    cv::Mat img_copy = img.clone();
    for(auto const &contour : contours){
        auto const rect = cv::boundingRect(contour);
        if(rect.area() >= 2000){
            cv::rectangle(img_copy, rect, {255, 0, 0}, 3);
        }
    }

    cv::imshow("binarize", gray);
    cv::imshow("color", img_copy);
    //cv::waitKey();
    cv::imwrite("result.jpg", img_copy);
}

void identify_ob_by_edges_yellow(cv::Mat const &img)
{
    cv::Mat gray;
    cv::cvtColor(img, gray, CV_BGR2GRAY);
    cv::threshold(gray, gray, 0, 255, cv::THRESH_BINARY | cv::THRESH_OTSU);
    auto const kernel = cv::getStructuringElement(cv::MORPH_RECT, {7,7});
    cv::dilate(gray, gray, kernel);

    std::vector<std::vector<cv::Point>> contours;
    cv::findContours(gray.clone(), contours, cv::RETR_TREE,
                     cv::CHAIN_APPROX_SIMPLE);
    cv::Mat img_copy = img.clone();
    for(auto const &contour : contours){
        auto const rect = cv::boundingRect(contour);
        if(rect.area() >= 2000){
            cv::rectangle(img_copy, rect, {255, 0, 0}, 3);
        }
    }

    cv::imshow("binarize", gray);
    cv::imshow("color", img_copy);
    //cv::waitKey();
    cv::imwrite("result.jpg", img_copy);
}

void enchance_ground(Mat const &frame, Mat &result){
    result = frame.clone();
    unsigned int threshold = 30;
    bool ground = false;
    for(int c = 0; c < frame.cols; c++){
        for(int r = 0; r < frame.rows; r++){
            ground = (frame.at<cv::Vec3b>(r,c)[0] + threshold > 172) && (frame.at<cv::Vec3b>(r,c)[0] - threshold < 172);
            ground = ground && (frame.at<cv::Vec3b>(r,c)[1] + threshold > 170) && (frame.at<cv::Vec3b>(r,c)[1] - threshold < 170);
            ground = ground && (frame.at<cv::Vec3b>(r,c)[2] + threshold > 157) && (frame.at<cv::Vec3b>(r,c)[2] - threshold < 157);

            if(ground){
                result.at<cv::Vec3b>(r, c) = {255,255,255}; 
            }
            else {
                result.at<cv::Vec3b>(r, c) = {0,0,0};
            }
        }
    }
    //cvtColor(frame, result, CV_BGR2GRAY);
}
