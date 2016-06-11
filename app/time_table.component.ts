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

        .table th, table td{
            border-top:none;
            height: 60px;
        }

        .modal-dialog{
            position: relative;
            display: table; //This is important
            overflow-y: auto;
            overflow-x: auto;
            width: auto;
            min-width: 300px;
        }

        .table th{
            background-color: lightblue;
        }

        .table{
            background-color: lightcyan;
        }

        legend{
            background-color: lightgreen;
            padding: 10px;
            border-radius: 5px
        }
    `]
})
export class AppCmp {
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
    public adding_table = false;
    public time_tables = [];
    public current_table:Object;

    constructor(private _service:TTM_Service){
        var self = this;
        this.initializeCurrentTable();

        this._service.getData().subscribe(
            (data) => {

                self.courses = data.json();

                self.courses.forEach((course)=> {

                    course.just_name = course.Name.substring(course.Name.indexOf(":")+2,course.Name.length);

                    course.Classes.forEach(((cls)=>{
                        cls.end_ts = new Date(cls.EndTime.substring(5,cls.EndTime.length-2)).getTime()/1000;
                        cls.start_ts = new Date(cls.StartTime.substring(5,cls.StartTime.length-2)).getTime()/1000;

                        cls.start_time = new Date(cls.start_ts * 1000).toLocaleTimeString();
                        cls.end_time = new Date(cls.end_ts * 1000).toLocaleTimeString();

                        /*if(course.just_name.toLowerCase().includes("software") || course.just_name.toLowerCase().includes("bahasa")){
                            for(var i=0;i<self.time_table.days.length;i++)
                                if(self.time_table.days[i].name == cls.Day){
                                    self.time_table.days[i].courses.push(course);
                                    break;
                                }
                        }*/

                        //testing
                        /*var time =new Date(cls.start_ts * 1000).toLocaleTimeString();
                         console.log(time);*/
                    }))


                    /*//check required courses & add them to table
                    if(course.just_name.toLowerCase().includes("software") || course.just_name.toLowerCase().includes("bahasa")){
                        course.required = true;
                        course.Classes.forEach((cls)=>{
                            for(var i=0;i<self.time_table.days.length;i++)
                                if(self.time_table.days[i].name == cls.Day){
                                    self.time_table.days[i].courses.push(course);
                                    course.added = true;
                                    break;
                                }
                        })
                    }*/
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


    initializeCurrentTable(){
        this.time_table = {
            days: [
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
            ],
            total_credits: 0,
            name: ""
        };
    }

    addCourse(course,e){
        var self = this;


        //if already added remove it.
        if(course.added){
            console.log("deleting this course");
            console.log(course);
            course.Classes.forEach((cls)=>{
                for(var i=0;i<self.time_table.days.length;i++)
                    if(cls.Day === self.time_table.days[i].name){
                        //self.time_table.days[i].courses.splice(self.time_table.days[i].courses.indexOf(course),1);

                        for(var k=0;k<self.time_table.days[i].courses.length;k++)
                            if(self.time_table.days[i].courses[k].just_name == course.just_name){
                                self.time_table.days[i].courses.splice(k,1);
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
            for(var i=0;i<self.time_table.days.length;i++){

                if(cls.Day === self.time_table.days[i].name){
                    for(var k=0;k<self.time_table.days[i].courses.length;k++){
                        if(cls.start_ts >= self.time_table.days[i].courses[k].start_ts && cls.start_ts < self.time_table.days[i].courses[k].end_ts
                            || cls.end_ts <= self.time_table.days[i].courses[k].end_ts && cls.end_ts > self.time_table.days[i].courses[k].start_ts){
                            toastr.error("Class time conflict occurred with "+self.time_table.days[i].courses[k].just_name);

                            console.log(cls);
                            console.log(self.time_table.days[i].courses[k]);


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

            for(var i=0;i<self.time_table.days.length;i++)
                if(cls.Day === self.time_table.days[i].name){

                    //course.just_name = course.Name.substring(course.Name.indexOf(":")+2,course.Name.length);

                    var course_cpy = JSON.parse(JSON.stringify(course));

                    course_cpy.start_time = cls.start_time;
                    course_cpy.end_time = cls.end_time;
                    course_cpy.start_ts = cls.start_ts;
                    course_cpy.end_ts = cls.end_ts;


                    /*for(var k=0;k<self.time_table.days[i].courses.length;k++){
                        if(course_cpy.start_ts < self.time_table.days[i].courses[k].start_ts)
                            self.time_table.days[i].courses.splice(0,course_cpy);
                        else if(self.time_table.days[i].courses[k+1] && course_cpy.start_ts >= self.time_table.days[i].courses[k].end_ts && course_cpy.start_ts <= self.time_table.days[i].courses[k+1].start_ts)
                            self.time_table.days[i].courses.splice(k+1,course_cpy);
                        else
                            self.time_table.days[i].courses.push(course_cpy)
                    }*/

                    if(self.time_table.days[i].courses.length === 0)
                        self.time_table.days[i].courses.push(course_cpy);
                    else{
                        for(var k=0;k<self.time_table.days[i].courses.length;k++){
                            if(course_cpy.start_ts < self.time_table.days[i].courses[k].start_ts){
                                self.time_table.days[i].courses.splice(0,0,course_cpy);
                                break;
                            }
                            else if(self.time_table.days[i].courses[k+1] && course_cpy.start_ts >= self.time_table.days[i].courses[k].end_ts && course_cpy.start_ts <= self.time_table.days[i].courses[k+1].start_ts) {
                                self.time_table.days[i].courses.splice(k+1,0,course_cpy);
                                break;
                            }
                            else if(course_cpy.start_ts > self.time_table.days[i].courses[k].start_ts){
                                self.time_table.days[i].courses.push(course_cpy);
                                break;
                            }
                        }
                    }

                    break;
                }


        });

        //console.log(self.time_table.days);

        course.added = true;
        self.time_table.total_credits += parseInt(course.Credits);
    }

    complete(){

        //checks if required courses are also added.
        for(var i=0;i<this.courses.length;i++)
            if((this.courses[i].just_name.toLowerCase().includes("software") || this.courses[i].just_name.toLowerCase().includes("bahasa"))
            && !this.courses[i].added
            ) return toastr.error("Software Engineering & Bahasa Jiwa Bangsa are required courses");


        toastr.success("Table table completed");
        this.adding_table = false;
        this.time_tables.push(JSON.parse(JSON.stringify(this.time_table)));
        this.initializeCurrentTable();
        this.courses.forEach((course)=>{
            course.added = false;
        })
    }

    goBack(){
        this.adding_table = false;
        this.initializeCurrentTable();
        this.courses.forEach((course)=>{
            course.added = false;
        });
    }

    ViewTimeTable(table){
        this.current_table = table;
    }

    /*addNewTable(){
        this.adding_table = !this.adding_table;
    }*/
}