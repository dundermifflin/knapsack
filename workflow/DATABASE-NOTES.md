To reset the database:

- back yo shit up:

make the backup:
  heroku pg:backups capture --app knapsack-2

make the url:
  heroku pg:backups public-url <b001> --app knapsack-2

go get the backup:
  curl -o latest.dump <your fancy long url>

      based on: https://devcenter.heroku.com/articles/heroku-postgres-backups


- got to  heroku pg:psql --app knapsack-2-app
DATABASE=> drop schema public cascade;
DATABASE=> create schema public;

- perhaps, to push downloaded (and modified?) backups backup:
https://devcenter.heroku.com/articles/heroku-postgres-import-export
* Note you can actually restore backups from Heroku without re-uploading, we think
