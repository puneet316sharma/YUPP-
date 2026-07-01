 #include <bits/stdc++.h>
 
double angle(int hour,int minutes){
    return ((hour*30)+(minutes*0.5)) ;
}
double angle2(int minutes){
    return (minutes*6);
}
 double angleClock(int hour, int minutes) {
       return abs(angle(hour,minutes)-angle2(minutes));
    }
    int main(){
        cout<<angleClock(12,30)<<endl;
        cout<<angleClock(3,30)<<endl;
        cout<<angleClock(3,15)<<endl;
return 0;

    }