import {Component} from '@angular/core';
import {TTM_Service} from './ttm_service';

@Component({
    selector: 'app',
    templateUrl: 'app/time_table.html',
    styles: [`
        .course_box{
            padding: 10px;
            display: inline-block;
            background-color: lightblue;
            border-radius: 10px;
            margin: 10px;
        }

        input[type="checkbox"]{
            height: 20px;
            width: 20px;
        }
    `]
})
export class AppCmp{
    public courses = [];
    public days  = [
        {
            name: "Mon",
            courses: []
        },
        {
            name: "Tue",
            courses: []
        },
        {
            name: "Wed",
            courses: []
        },
        {
            name: "Thu",
            courses: []
        },
        {
            name: "Fri",
            courses: []
        }
    ];

    public time_table:Object;
    public table_comp = false;

    constructor(private _service:TTM_Service){
        var self = this;

        this.time_table = {
            days: this.days,
            total_credits: 0
        };


        this._service.getData().subscribe(
            (data) => {

                self.courses = data.json();

                self.courses.forEach((course)=> {
                    course.Classes.forEach(((cls)=>{
                        cls.end_ts = new Date(cls.EndTime.substring(5,cls.EndTime.length-2)).getTime()/1000;
                        cls.start_ts = new Date(cls.StartTime.substring(5,cls.StartTime.length-2)).getTime()/1000;

                        cls.start_time = new Date(cls.start_ts * 1000).toLocaleTimeString();
                        cls.end_time = new Date(cls.end_ts * 1000).toLocaleTimeString();

                        //testing
                        /*var time =new Date(cls.start_ts * 1000).toLocaleTimeString();
                        console.log(time);*/
                    }))
                });

                console.log(self.courses);
                /*console.log(self.courses[0].Classes[0].EndTime);
                console.log(self.courses[0].Classes[0].EndTime.substring(5,self.courses[0].Classes[0].EndTime.length-2));
                console.log(new Date(self.courses[0].Classes[0].EndTime.substring(5,self.courses[0].Classes[0].EndTime.length-2)).getTime()/1000);
                console.log(self.courses[0].Classes[0].StartTime.substring(5,self.courses[0].Classes[0].StartTime.length-2));
                console.log(new Date(self.courses[0].Classes[0].StartTime.substring(5,self.courses[0].Classes[0].StartTime.length-2)).getTime()/1000);*/
            },
            (err) => console.log(err),
            () => console.log("done with the request")
        )
    }

    addCourse(course,e){
        var self = this;


        //if already added remove it.
        if(course.added){
            console.log("deleting this course");
            console.log(course);
            course.Classes.forEach((cls)=>{
                for(var i=0;i<self.days.length;i++)
                    if(cls.Day === self.days[i].name){
                        //self.days[i].courses.splice(self.days[i].courses.indexOf(course),1);

                        for(var k=0;k<self.days[i].courses.length;k++)
                            if(self.days[i].courses[k].just_name == course.just_name){
                                self.days[i].courses.splice(k,1);
                                break;
                            }

                    }
            });

            self.time_table.total_credits -= parseInt(course.Credits);
            return course.added = false;

        }


        /*if(this.time_table.total_credits + parseInt(course.Credits) > 15){
            $(e.target).attr("checked",false);
            return toastr.error("You cannot add more than 15 credit hours");
        }*/


        //check if class time spot already filled
        var conflict = false;
        course.Classes.forEach((cls)=>{
            if(conflict) return;
            for(var i=0;i<self.days.length;i++){

                if(cls.Day === self.days[i].name){
                    for(var k=0;k<self.days[i].courses.length;k++){
                        if(cls.start_ts >= self.days[i].courses[k].start_ts && cls.start_ts < self.days[i].courses[k].end_ts
                            || cls.end_ts <= self.days[i].courses[k].end_ts && cls.end_ts > self.days[i].courses[k].start_ts){
                            toastr.error("Class time conflict occurred");

                            console.log(cls);
                            console.log(self.days[i].courses[k]);


                            $(e.target).attr("checked",false);
                            conflict = true;
                            return;
                        }

                    }
                    break;
                }
            }
        });

        if(conflict) return;


        course.Classes.forEach((cls)=>{

            for(var i=0;i<self.days.length;i++)
                if(cls.Day === self.days[i].name){

                    course.just_name = course.Name.substring(course.Name.indexOf(":")+2,course.Name.length);

                    var course_cpy = JSON.parse(JSON.stringify(course));

                    course_cpy.start_time = cls.start_time;
                    course_cpy.end_time = cls.end_time;
                    course_cpy.start_ts = cls.start_ts;
                    course_cpy.end_ts = cls.end_ts;


                    /*for(var k=0;k<self.days[i].courses.length;k++){
                        if(course_cpy.start_ts < self.days[i].courses[k].start_ts)
                            self.days[i].courses.splice(0,course_cpy);
                        else if(self.days[i].courses[k+1] && course_cpy.start_ts >= self.days[i].courses[k].end_ts && course_cpy.start_ts <= self.days[i].courses[k+1].start_ts)
                            self.days[i].courses.splice(k+1,course_cpy);
                        else
                            self.days[i].courses.push(course_cpy)
                    }*/

                    if(self.days[i].courses.length === 0)
                        self.days[i].courses.push(course_cpy);
                    else{
                        for(var k=0;k<self.days[i].courses.length;k++){
                            if(course_cpy.start_ts < self.days[i].courses[k].start_ts){
                                self.days[i].courses.splice(0,0,course_cpy);
                                break;
                            }
                            else if(self.days[i].courses[k+1] && course_cpy.start_ts >= self.days[i].courses[k].end_ts && course_cpy.start_ts <= self.days[i].courses[k+1].start_ts) {
                                self.days[i].courses.splice(k+1,0,course_cpy);
                                break;
                            }
                            else if(course_cpy.start_ts > self.days[i].courses[k].start_ts){
                                self.days[i].courses.push(course_cpy);
                                break;
                            }
                        }
                    }

                    break;
                }


        });

        console.log(self.days);

        course.added = true;
        self.time_table.total_credits += parseInt(course.Credits);
    }

    complete(){
        toastr.success("Table table completed");
        this.table_comp = true;
    }
}