FLAGS = `pkg-config --cflags opencv`
LIBS = `pkg-config --libs opencv`

% : %.cpp
	g++ $(CFLAGS) $(LIBS) -o $@ $<

all:
	cc HoughCircle_Demo.cpp -o test
