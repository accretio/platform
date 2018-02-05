#include "opencv2/imgcodecs.hpp"
#include "opencv2/highgui.hpp"
#include "opencv2/imgproc.hpp"
#include <iostream>

using namespace std;
using namespace cv;


namespace
{
  

}

int thresh = 50;
RNG rng(12345);

// helper function:
// finds a cosine of angle between vectors
// from pt0->pt1 and from pt0->pt2
static double angle( Point pt1, Point pt2, Point pt0 )
{
    double dx1 = pt1.x - pt0.x;
    double dy1 = pt1.y - pt0.y;
    double dx2 = pt2.x - pt0.x;
    double dy2 = pt2.y - pt0.y;
    return (dx1*dx2 + dy1*dy2)/sqrt((dx1*dx1 + dy1*dy1)*(dx2*dx2 + dy2*dy2) + 1e-10);
}

// the function draws all the squares in the image
static void drawSquare( Mat& image, const vector<Point> & square )
{
    
  const Point* p = &square[0];
  
  int n = (int)square.size();
  //dont detect the border
  if (p-> x > 3 && p->y > 3)
    polylines(image, &p, &n, 1, true, Scalar(120,200,40), 1, LINE_AA);
  

}


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
  area = src; // src(Rect(refInstrTopLeftX, refInstrTopLeftY, refInstrWidth, refInstrHeight));

  
  // Turn the image to gray and blur it
  
  cvtColor( area, area_gray, COLOR_BGR2GRAY );

  // TODO: figure out the proper blurring
  // medianBlur(area_gray, area_gray, 5);
   GaussianBlur( area_gray, area_gray, Size(11, 11), 2, 2 );

  // canny the image
  Canny( area_gray, canny_output, thresh, thresh*2, 3 );

  // that's the output image
  Mat drawing = area_gray; // Mat::zeros( canny_output.size(), CV_8UC3 );


  // look for contours

  vector<vector<Point> > contours;
  vector<Vec4i> hierarchy;

  findContours( canny_output, contours, hierarchy, CV_RETR_TREE, CV_CHAIN_APPROX_NONE, Point(refInstrTopLeftX, refInstrTopLeftY) );

 
  // look for rectangles
   vector<Point> approx;
   // this is the rectangle we use for the normalization
   vector<Point> refRectangle; 

   int c = 0;
   size_t i;
   for(i = 0; i < contours.size(); i++ )
     {

       Scalar color = Scalar( rng.uniform(0, 255), rng.uniform(0,255), rng.uniform(0,255) );
       
       // approximate contour with accuracy proportional
       // to the contour perimeter
       approxPolyDP(Mat(contours[i]), approx, arcLength(Mat(contours[i]), true)*0.02, true);
      
       if( approx.size() == 4 
	  &&
	   fabs(contourArea(Mat(approx))) > 1000 &&
	   isContourConvex(Mat(approx)) ) 
	 {
	   double maxCosine = 0;
	   
	   for( int j = 2; j < 5; j++ )
	     {
	       // find the maximum cosine of the angle between joint edges
	       double cosine = fabs(angle(approx[j%4], approx[j-2], approx[j-1]));
	       maxCosine = MAX(maxCosine, cosine);
	     }
	   
	   // if cosines of all angles are small
	   // (all angles are ~90 degree) then write quandrange
	   // vertices to resultant sequence
	    if( maxCosine < 0.3 ) {
	      
	      //  drawSquare(drawing, approx);
	      if (c > 5) {
		std::cout << "breaking " << c  << "\n";
		refRectangle = approx;
		break;
	      }
	      c++;
	      //drawContours( drawing, contours, i, color, 2, 8, hierarchy, 0, Point() );
	    }
	 }
       
     }


   std::cout << "Found square contour " << i << "\n";
   Scalar color = Scalar( rng.uniform(0, 255), rng.uniform(0,255), rng.uniform(0,255) );
      
   // drawContours( drawing, contours, i, color, 2, 8, hierarchy, 0, Point() );
    drawSquare(drawing, refRectangle);
   // say we now have a rectangle. we need to normalize the image around approx
    
   std::vector<Point2f> quad_pts;
   std::vector<Point2f> squre_pts;
   
   // TODO: pull the exact dimensions of the instrument
   
  
   quad_pts.push_back(Point2f(refRectangle[1].x,refRectangle[1].y));
  
   quad_pts.push_back(Point2f(refRectangle[2].x,refRectangle[2].y));
   quad_pts.push_back(Point2f(refRectangle[0].x,refRectangle[0].y));
   quad_pts.push_back(Point2f(refRectangle[3].x,refRectangle[3].y));
  
   std::cout << quad_pts << std::endl;
   
   Rect boundRect = boundingRect(contours[i]);
   squre_pts.push_back(Point2f(boundRect.x,boundRect.y));
   squre_pts.push_back(Point2f(boundRect.x,boundRect.y+boundRect.height));
   squre_pts.push_back(Point2f(boundRect.x+boundRect.width,boundRect.y));
   squre_pts.push_back(Point2f(boundRect.x+boundRect.width,boundRect.y+boundRect.height));

    std::cout << squre_pts << std::endl;
  
   rectangle(drawing, boundRect, color);
   
   
   Mat transmtx = getPerspectiveTransform(quad_pts, squre_pts);
   // drawing = Mat::zeros(src.rows, src.cols, CV_8UC3);
  
    warpPerspective(src, drawing, transmtx, src.size());
   
   // rectangle(src,boundRect,Scalar(0,255,0),1,8,0);
   rectangle(drawing, boundRect, Scalar(0,255,0),1,8,0);
   
   //polylines(drawing, quad_pts, true, Scalar(0, 255, 255)); // or perhaps 0
   //polylines(drawing, squre_pts, false, Scalar(255, 255, 0)); // or perhaps 0
   
  



  

  
   /* for( int i = 0; i< contours.size(); i++ )
    {
      Scalar color = Scalar( rng.uniform(0, 255), rng.uniform(0,255), rng.uniform(0,255) );
      drawContours( drawing, contours, i, color, 2, 8, hierarchy, 0, Point() );
      } */


  // we select a curve and we make it fit an ellipsis?
   for( int i = 0; i< contours.size(); i++ )
    {
      size_t count = contours[i].size();
      if( count < 6 )
	continue;
      Mat pointsf;
      Mat(contours[i]).convertTo(pointsf, CV_32F);
      RotatedRect box = fitEllipse(pointsf);
      
      //  ellipse(drawing, box, Scalar(0,0,255), 1, LINE_AA);
      
      } 


   // ok so now the user picks up the 3.125 tool.

   // we need to compute the transformation that will turn that into a circle & apply to the whole image.

   // is that correct?

   // may be easier to do with a phone?? Can you make measurements with a phone directly?
   

   
  imshow( "Contours", drawing );


  // imshow( "test", src);
  while(key != 'q' && key != 'Q')
    {
      key = (char)waitKey(-1);
    }


 

  
  return 0;
}


