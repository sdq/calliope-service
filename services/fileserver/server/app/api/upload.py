import werkzeug, os
from flask_restful import Resource, reqparse
from ..flask_uploads import UploadSet, DATA
from ..data import load_df, load_schema

upload = UploadSet('csvs', DATA)
ALLOWED_EXTENSIONS = set(['csv'])

class Upload(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('file',type=werkzeug.datastructures.FileStorage, location='files')
        args = parser.parse_args()
        file = args['file']
        if file and self.allowed_file(file.filename):
            filename = upload.save(file)
            file_url = upload.url(filename)
            real_filename = file_url.split('/')[-1],
            real_fileurl = "/data/%s"%(real_filename)
            df = load_df('./csvs/%s'%(filename))
            schema = load_schema(df)
            schema['fields'] = list(map(lambda x: {'field': x['field'], 'type': x['type']}, schema['fields']))
            return {
                "file_name": real_filename,
                "file_url": real_fileurl,
                "schema": schema
            }
        else:
            return {
                'message':'No file found',
                'status':'error'
            }

    def allowed_file(self, filename):
        return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS