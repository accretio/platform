#include "opencv2/imgcodecs.hpp"
#include "opencv2/highgui.hpp"
#include "opencv2/imgproc.hpp"
#include <iostream>

using namespace std;
using namespace cv;


namespace
{
  

}

int thresh = 100;
RNG rng(12345);

int main(int argc, char** argv)
{
  Mat src, area, area_gray, canny_output;
 
  String imageName;
  int refInstrTopLeftX, refInstrTopLeftY, refInstrWidth, refInstrHeight;
  char key = 0;
  
  // Deal with the parameters

  imageName = argv[1];
  refInstrTopLeftX = atoi(argv[2]);
  refInstrTopLeftY = atoi(argv[3]);

  refInstrWidth = atoi(argv[4]);
  refInstrHeight = atoi(argv[5]);
 
  // Load the image
    
  src = imread( imageName, IMREAD_COLOR );

  if(src.empty())
    {
      cerr << "Invalid input image\n";
      return -1;
    }
  
  cout << "Image " << imageName << " loaded" << "\n";

  // select the area
  area = src(Rect(refInstrTopLeftX, refInstrTopLeftY, refInstrWidth, refInstrHeight));

  
  // Turn the image to gray and blur it
  
  cvtColor( area, area_gray, COLOR_BGR2GRAY );
  GaussianBlur( area_gray, area_gray, Size(11, 11), 2, 2 );

  
  

  // look for contours
  Canny( area_gray, canny_output, thresh, thresh*2, 3 );

  vector<vector<Point> > contours;
  vector<Vec4i> hierarchy;

  findContours( canny_output, contours, hierarchy, CV_RETR_TREE, CV_CHAIN_APPROX_SIMPLE, Point(refInstrTopLeftX, refInstrTopLeftY) );


  Mat drawing = src; // Mat::zeros( canny_output.size(), CV_8UC3 );
  for( int i = 0; i< contours.size(); i++ )
    {
      Scalar color = Scalar( rng.uniform(0, 255), rng.uniform(0,255), rng.uniform(0,255) );
      drawContours( drawing, contours, i, color, 2, 8, hierarchy, 0, Point() );
    }

  imshow( "Contours", drawing );
  // imshow( "test", src);
  while(key != 'q' && key != 'Q')
    {
      key = (char)waitKey(-1);
    }
  
  return 0;
}


