export const StudentsData = {
  getData() {
    return [
      {
        "id": "101",
        "school": "King",
        "first_name": "Johnny",
        "last_name": "Doe",
        "grade": "4",
        "home_room_teacher": "Mrs. Teach",
        "tutor_ln": "Doe",
        "tutor_fn": "John",
        "intervention_program": "Barton",
        "level_lesson": "Level 4, Lesson 2",
        "date_intervention_began": "2022-07-09",
        "services": "none",
        "new_student": true,
        "moved": false,
        "new_location": "",
        "withdrew": false,
        "additional_comments": "",
        "last_edited_by": null,
        "last_edited_at": null,
        "created_at": "2022-07-09"
      },
      {
        "id": "102",
        "school": "King",
        "first_name": "Janie",
        "last_name": "Doe",
        "grade": "4",
        "home_room_teacher": "Mr. Smith",
        "tutor_ln": "Doe",
        "tutor_fn": "John",
        "intervention_program": "Barton",
        "level_lesson": "Level 4, Lesson 2",
        "date_intervention_began": "2022-07-09",
        "services": "none",
        "new_student": false,
        "moved": true,
        "new_location": "",
        "withdrew": false,
        "additional_comments": "",
        "last_edited_by": null,
        "last_edited_at": null,
        "created_at": "2022-07-09"
      },
      {
        "id": "103",
        "school": "King",
        "first_name": "Joshua",
        "last_name": "Doe",
        "grade": "4",
        "home_room_teacher": "Ms. Jones",
        "tutor_ln": "Doe",
        "tutor_fn": "John",
        "intervention_program": "Barton",
        "level_lesson": "Level 4, Lesson 2",
        "date_intervention_began": "2022-07-09",
        "services": "none",
        "new_student": false,
        "moved": false,
        "new_location": "",
        "withdrew": true,
        "additional_comments": "",
        "last_edited_by": null,
        "last_edited_at": null,
        "created_at": "2023-07-09"
      }
    ]
  },

  getStudents() {
    return Promise.resolve(this.getData());
  },

};
