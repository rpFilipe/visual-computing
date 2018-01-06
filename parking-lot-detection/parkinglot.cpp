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

#include <cstdlib>
#include "opencv2/objdetect/objdetect.hpp"
#include "opencv2/core/core.hpp"
#include <vector>
#include "opencv2/imgproc/imgproc.hpp"

#include "opencv2/highgui/highgui.hpp"


// If you want to "simplify" code writing, you might want to use:

using namespace cv;
using namespace std;
vector<vector<Point>> getEdges(cv::Mat const &img);
void makeBinary(cv::Mat const &img, cv::Mat &result);
void makeBoder(cv::Mat &img, int borderSize);
void enchance_ground(cv::Mat const &img, cv::Mat &result);
void cHoughLines(cv::Mat const &img, cv::Mat &result0, cv::Mat &result1, int minLineLength, int maxLineGap);
void cascadeClassifier(cv::Mat const &img, cv::Mat &result);
void applyCLAHE(cv::Mat const &img, int clim, cv::Mat &result);
void increace_contrast(cv::Mat const &image, double alpha, int beta, cv::Mat &result);
void foo(cv::Mat const &img, double alpha, int beta, cv::Mat &result);
void foo2(cv::Mat const &img, double alpha, int beta, cv::Mat &result);

CascadeClassifier cars_cascade;
Mat original;

int main( int argc, char** argv )
{
    if( argc != 3)
    {
        cout << "The name of the video file is missing !!" << endl;

        return -1;
    }

    int method = atoi(argv[2]);
    string smethod = "";
    const string videoFilename = argv[1];	 
    cars_cascade.load("cars2.xml");       
	
	// Open Camera or Video	File
	VideoCapture cap;
    cap.open(videoFilename);
    

	if (!cap.isOpened())
	{
		cout << "Could not open: " << videoFilename << endl;
		return -1;
	}
	
	const unsigned long int total_frames = cap.get(CV_CAP_PROP_FRAME_COUNT);
	Size videoSize = Size((int)cap.get(CV_CAP_PROP_FRAME_WIDTH), (int)cap.get(CV_CAP_PROP_FRAME_HEIGHT));
	
	  while(1){
 
    Mat workingFrame;
    Mat workingFrame1;
    Mat dilationElement;

    // Capture frame-by-frame
    cap >> original;

    // If the frame is empty, break immediately
    if (original.empty())
        break;
	int morphSize = 3;

      
	//chance size so windows can be more maneuverable
    resize(original, original, Size(640, 480), 0, 0, CV_INTER_LINEAR);
    

    switch(method){

        case 0: enchance_ground(original, workingFrame);
        smethod = "";
                break;
        /*case 1: getEdges(original);
        smethod = "getEdges";
                break;*/
        case 2: cHoughLines(original, workingFrame, workingFrame1, 70, 20);
        smethod = "cHoughLines";
                break;   
        case 3: cascadeClassifier(original, workingFrame);
        smethod = "cascadeClassifier";
                break;

        case 4: applyCLAHE(original, 4, workingFrame);
        smethod = "applyCLAHE";
                break;

        case 5: increace_contrast(original, 2, 0, workingFrame);
        smethod = "increace_contrast";
                break;
        case 6: foo(original, 2 ,2 , workingFrame);
        smethod = "foo";
                break;
        case 7: foo2(original, 2, 2, workingFrame);
        smethod = "foo2";
                break;

    }
    //cvtColor( workingFrame, workingFrame, cv::COLOR_RGB2GRAY );
    //auto const kernel = cv::getStructuringElement(cv::MORPH_RECT, {3,3});
    //cv::dilate(workingFrame, workingFrame, kernel);
    //getEdges(frame);  
    //cv::imshow("Betther Ground", workingFrame);
    //cvtColor(frame, workingFrame, cv::COLOR_RGB2GRAY);
    //lines = cv2.HoughLinesP(edges,1,np.pi/180,40,minLineLength=30,maxLineGap=30)
    //threshold( workingFrame, workingFrame, 180,255,THRESH_BINARY ); 
    //dilationElement = getStructuringElement(MORPH_ELLIPSE, Size(morphSize, morphSize));
    //dilate(workingFrame, workingFrame, dilationElement);
        
    
    
    imshow( "Original", original );
    cv::imwrite("result.jpg", original);
    imshow( smethod, workingFrame );
 
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
void cHoughLines(cv::Mat const &newFrame, cv::Mat &cdst, cv::Mat &cdstP,int minLineLength, int maxLineGap){

    Mat workingFrame;
    // Edge detection
    Canny(newFrame, workingFrame, 50, 200, 3);

    imshow("dfs", workingFrame);

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
    HoughLinesP(workingFrame, linesP, 1, CV_PI/180, 50, minLineLength, maxLineGap ); // runs the actual detection
    // Draw the lines
    for( size_t i = 0; i < linesP.size(); i++ )
    {
        Vec4i l = linesP[i];
        line( cdstP, Point(l[0], l[1]), Point(l[2], l[3]), Scalar(0,0,255), 3, CV_AA);
    }
    
    //imshow("Detected Lines (in red) - Standard Hough Line Transform", cdst);
    //imshow("Detected Lines (in red) - Probabilistic Line Transform", cdstP);
    
}

void makeBoder(cv::Mat &img, int borderSize){

    cv::copyMakeBorder(img, img, borderSize, borderSize,
        borderSize, borderSize, BORDER_CONSTANT, Scalar(255 ,255 , 255));
}

void makeBinary(cv::Mat const &img, cv::Mat &result){

    result = img.clone();
    //cv::Mat gray;
    //cv::pyrMeanShiftFiltering(img,gray,10,10);
    cv::cvtColor(img, result, CV_BGR2GRAY);
    cv::threshold(result, result, 0, 255, cv::THRESH_BINARY + cv::THRESH_OTSU);
    auto const kernel = cv::getStructuringElement(cv::MORPH_RECT, {1,1});
    cv::dilate(result, result, kernel);


}

vector<vector<Point>> getEdges(cv::Mat const &img)
{
    /*cv::Mat gray;
    //cv::pyrMeanShiftFiltering(img,gray,10,10);
    cv::cvtColor(img, gray, CV_BGR2GRAY);
    cv::threshold(gray, gray, 0, 255, cv::THRESH_BINARY + cv::THRESH_OTSU);
    auto const kernel = cv::getStructuringElement(cv::MORPH_RECT, {1,1});
    cv::dilate(gray, gray, kernel);*/

    std::vector<std::vector<cv::Point>> contours;


    cv::findContours(img.clone(), contours, cv::RETR_TREE,
                     cv::CHAIN_APPROX_SIMPLE);

    return contours;

    /*
    result = a.clone();
    for(auto const &contour : contours){
        auto const rect = cv::boundingRect(contour);
        if(rect.area() >= 7000 && rect.area() < 30000 ){
            cv::rectangle(result, rect, {255, 0, 0}, 3);
        }
    }

    //cv::imshow("binarize", gray);
    //cv::imshow("color", img_copy);
    //cv::imwrite("result.jpg", img_copy);

    */
}

void applyCLAHE(cv::Mat const &img, int clim, cv::Mat &result) { 
    //Function that applies the CLAHE algorithm to "dstArry".
    // READ RGB color image and convert it to Lab
    result = img.clone();

    cv::cvtColor(img, result, CV_BGR2Lab);

    // Extract the L channel
    std::vector<cv::Mat> lab_planes(3);
    cv::split(result, lab_planes);  // now we have the L image in lab_planes[0]

    // apply the CLAHE algorithm to the L channel
    cv::Ptr<cv::CLAHE> clahe = cv::createCLAHE();
    clahe->setClipLimit(clim);
    cv::Mat dst;
    clahe->apply(lab_planes[0], dst);

    // Merge the the color planes back into an Lab image
    dst.copyTo(lab_planes[0]);
    cv::merge(lab_planes, result);

   // convert back to RGB
   cv::Mat image_clahe;
   cv::cvtColor(result, image_clahe, CV_Lab2BGR);

   // display the results  (you might also want to see lab_planes[0] before and after).
   //cv::imshow("image CLAHE", lab_planes);
}

void cascadeClassifier(cv::Mat const &img, cv::Mat &result){
    
        std::vector<Rect> cars;
        result = img.clone();
    
    
        cars_cascade.detectMultiScale(result, cars, 1.1, 1);
    
        for (auto& car : cars){
            rectangle(result, Rect(car.x,car.y, car.x+car.width,car.y+car.height), {0,0,255}, 2);
             
        }
    }

void enchance_ground(cv::Mat const &img, cv::Mat &result){
    result = img.clone();
    unsigned int threshold = 30;
    bool ground = false;
    for(int c = 0; c < img.cols; c++){
        for(int r = 0; r < img.rows; r++){
            ground = (img.at<cv::Vec3b>(r,c)[0] + threshold > 172) && (img.at<cv::Vec3b>(r,c)[0] - threshold < 172);
            ground = ground && (img.at<cv::Vec3b>(r,c)[1] + threshold > 170) && (img.at<cv::Vec3b>(r,c)[1] - threshold < 170);
            ground = ground && (img.at<cv::Vec3b>(r,c)[2] + threshold > 157) && (img.at<cv::Vec3b>(r,c)[2] - threshold < 157);

            if(ground){
                result.at<cv::Vec3b>(r, c) = {255,255,255}; 
            }
            else {
                result.at<cv::Vec3b>(r, c) = {0,0,0};
            }
        }
    }
    //applyCLAHE(result, 5);
    //imshow("test", result);
    //cvtColor(frame, result, CV_BGR2GRAY);
}

void increace_contrast(cv::Mat const &image, double alpha, int beta, cv::Mat &result){

    /// Read image given by user
    Mat new_image = Mat::zeros( image.size(), image.type() );

     /// Do the operation new_image(i,j) = alpha*image(i,j) + beta
     for( int y = 0; y < image.rows; y++ )
        { for( int x = 0; x < image.cols; x++ )
             { for( int c = 0; c < 3; c++ )
                  {
          new_image.at<Vec3b>(y,x)[c] =
             saturate_cast<uchar>( alpha*( image.at<Vec3b>(y,x)[c] ) + beta );
                 }
        }
        }

        result = new_image.clone();

     //getEdges(new_image, result);
}


void foo(cv::Mat const&img, double alpha, int beta, cv::Mat &result){
    Mat cdst;
    Mat cdstP;
    Mat workingFrame;

    // Read image given by user
    Mat new_image = Mat::zeros( img.size(), img.type() );

     /// Do the operation new_image(i,j) = alpha*image(i,j) + beta
     for( int y = 0; y < img.rows; y++ )
        { for( int x = 0; x < img.cols; x++ )
             { for( int c = 0; c < 3; c++ )
                  {
          new_image.at<Vec3b>(y,x)[c] =
             saturate_cast<uchar>( alpha*( img.at<Vec3b>(y,x)[c] ) + beta );
                 }
        }
        }

     /// Create Windows

  // Edge detection
    Canny(new_image, workingFrame, 50, 200, 3);
    // Copy edges to the images that will display the results in BGR
    cvtColor(workingFrame, cdst, COLOR_GRAY2BGR);
    cdstP = cdst.clone();
        result = cdst.clone();
     //getEdges(cdstP, result);
}

void foo2(cv::Mat const&img, double alpha, int beta, cv::Mat &result){

    
    result = img.clone();
    Mat tmp = img.clone();
    makeBoder(original, 3);

    result = original.clone();

    Mat hl, hlp;

    increace_contrast(result, alpha, beta, tmp);

    makeBinary(tmp, tmp);

    imshow( "contrast", tmp );
    
    vector<vector<Point>> cars = getEdges(tmp);

    /*Mat inverseImage;
    bitwise_not(tmp, inverseImage);

    imshow( "inverse", inverseImage );
*/

    Mat freespaces = original.clone();
    //applyCLAHE(original, 2, freespaces);
    cHoughLines(freespaces, hl, hlp, 15, 20);
    makeBinary(hlp, hlp);
    imshow( "frespace", hlp );
    vector<vector<Point>> spaces = getEdges(hlp);

    //bool intersects = ((A & B).area() > 0);

    for(auto const &car : cars){
        auto const rect = cv::boundingRect(car);
        if(rect.area() >= 10000 && rect.area() < 100000 ){
            cv::rectangle(result, rect, {0, 0, 255}, 3);
        }
    }

    bool trueFreeSpace;
    Rect overlap, runion;
    for(auto const &space : spaces){
        auto const rect = cv::boundingRect(space);
        trueFreeSpace = true;
        for(auto const &car : cars){

            auto const rectc = cv::boundingRect(car);
            // filter small rectangles

            if(rect.area() < 10000 || rectc.area() <10000)
                continue;

            overlap = rectc & rect;
            runion = rectc | rect;

            //cv::rectangle(result, rect, {0, 0, 0}, 3);
            if(overlap.area() > 0.25 * runion.area())
            {
                trueFreeSpace = false;
                break;
            }
        }


        if(rect.area() >= 15000 && rect.area() < 70000 && trueFreeSpace){
            cv::rectangle(result, rect, {0, 255, 0}, 3);
        }
    }

}