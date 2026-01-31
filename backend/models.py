import sqlite3
from typing import List, Optional
from config import DATABASE_PATH
from datetime import datetime

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class Filament:
    @staticmethod
    def create_table():
        conn = get_db()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS filaments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                price_per_kg REAL NOT NULL
            )
        ''')
        conn.commit()
        conn.close()
    
    @staticmethod
    def get_all():
        conn = get_db()
        filaments = conn.execute('SELECT * FROM filaments ORDER BY name').fetchall()
        conn.close()
        return [dict(f) for f in filaments]
    
    @staticmethod
    def get_by_id(filament_id):
        conn = get_db()
        filament = conn.execute('SELECT * FROM filaments WHERE id = ?', (filament_id,)).fetchone()
        conn.close()
        return dict(filament) if filament else None
    
    @staticmethod
    def create(name, price_per_kg):
        conn = get_db()
        cursor = conn.execute('INSERT INTO filaments (name, price_per_kg) VALUES (?, ?)', 
                            (name, price_per_kg))
        conn.commit()
        filament_id = cursor.lastrowid
        conn.close()
        return filament_id
    
    @staticmethod
    def update(filament_id, name, price_per_kg):
        conn = get_db()
        conn.execute('UPDATE filaments SET name = ?, price_per_kg = ? WHERE id = ?',
                    (name, price_per_kg, filament_id))
        conn.commit()
        conn.close()
    
    @staticmethod
    def delete(filament_id):
        conn = get_db()
        conn.execute('DELETE FROM filaments WHERE id = ?', (filament_id,))
        conn.commit()
        conn.close()

class Print:
    @staticmethod
    def create_table():
        conn = get_db()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS prints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                uploader TEXT NOT NULL,
                image_path TEXT,
                link TEXT,
                filament_grams REAL NOT NULL,
                filament_type_id INTEGER NOT NULL,
                payment_status TEXT DEFAULT 'offen',
                price REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (filament_type_id) REFERENCES filaments (id)
            )
        ''')
        conn.commit()
        conn.close()
    
    @staticmethod
    def get_all(uploader_filter=None, status_filter=None):
        conn = get_db()
        query = '''
            SELECT p.*, f.name as filament_name, f.price_per_kg
            FROM prints p
            JOIN filaments f ON p.filament_type_id = f.id
            WHERE 1=1
        '''
        params = []
        
        if uploader_filter:
            query += ' AND p.uploader = ?'
            params.append(uploader_filter)
        
        if status_filter:
            query += ' AND p.payment_status = ?'
            params.append(status_filter)
        
        query += ' ORDER BY p.created_at DESC'
        
        prints = conn.execute(query, params).fetchall()
        conn.close()
        return [dict(p) for p in prints]
    
    @staticmethod
    def get_by_id(print_id):
        conn = get_db()
        print_item = conn.execute('''
            SELECT p.*, f.name as filament_name, f.price_per_kg
            FROM prints p
            JOIN filaments f ON p.filament_type_id = f.id
            WHERE p.id = ?
        ''', (print_id,)).fetchone()
        conn.close()
        return dict(print_item) if print_item else None
    
    @staticmethod
    def create(name, uploader, image_path, link, filament_grams, filament_type_id):
        conn = get_db()
        
        # Get filament price
        filament = conn.execute('SELECT price_per_kg FROM filaments WHERE id = ?', 
                              (filament_type_id,)).fetchone()
        
        price = (filament_grams / 1000) * filament['price_per_kg'] if filament else 0
        
        cursor = conn.execute('''
            INSERT INTO prints (name, uploader, image_path, link, filament_grams, 
                              filament_type_id, price)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (name, uploader, image_path, link, filament_grams, filament_type_id, price))
        
        conn.commit()
        print_id = cursor.lastrowid
        conn.close()
        return print_id
    
    @staticmethod
    def update(print_id, name, uploader, link, filament_grams, filament_type_id, payment_status):
        conn = get_db()
        
        # Recalculate price
        filament = conn.execute('SELECT price_per_kg FROM filaments WHERE id = ?', 
                              (filament_type_id,)).fetchone()
        price = (filament_grams / 1000) * filament['price_per_kg'] if filament else 0
        
        conn.execute('''
            UPDATE prints 
            SET name = ?, uploader = ?, link = ?, filament_grams = ?, 
                filament_type_id = ?, payment_status = ?, price = ?
            WHERE id = ?
        ''', (name, uploader, link, filament_grams, filament_type_id, payment_status, price, print_id))
        
        conn.commit()
        conn.close()
    
    @staticmethod
    def update_payment_status(print_id, status):
        conn = get_db()
        conn.execute('UPDATE prints SET payment_status = ? WHERE id = ?', (status, print_id))
        conn.commit()
        conn.close()
    
    @staticmethod
    def delete(print_id):
        conn = get_db()
        conn.execute('DELETE FROM prints WHERE id = ?', (print_id,))
        conn.commit()
        conn.close()
    
    @staticmethod
    def get_summary_by_uploader():
        conn = get_db()
        summary = conn.execute('''
            SELECT 
                uploader,
                COUNT(*) as total_prints,
                SUM(CASE WHEN payment_status = 'offen' THEN price ELSE 0 END) as open_amount,
                SUM(CASE WHEN payment_status = 'bezahlt' THEN price ELSE 0 END) as paid_amount,
                SUM(price) as total_amount
            FROM prints
            GROUP BY uploader
            ORDER BY uploader
        ''').fetchall()
        conn.close()
        return [dict(s) for s in summary]
    
    @staticmethod
    def get_statistics(start_date=None, end_date=None):
        conn = get_db()
        
        # Build date filter
        date_filter = ""
        params = []
        
        if start_date:
            date_filter += " AND date(p.created_at) >= date(?)"
            params.append(start_date)
        
        if end_date:
            date_filter += " AND date(p.created_at) <= date(?)"
            params.append(end_date)
        
        # Total statistics
        total_stats = conn.execute(f'''
            SELECT 
                COUNT(*) as total_prints,
                SUM(p.filament_grams) as total_filament,
                SUM(p.price) as total_cost,
                AVG(p.price) as avg_price_per_print
            FROM prints p
            WHERE 1=1 {date_filter}
        ''', params).fetchone()
        
        # Prints per month
        prints_per_month = conn.execute(f'''
            SELECT 
                strftime('%Y-%m', p.created_at) as month,
                COUNT(*) as count
            FROM prints p
            WHERE 1=1 {date_filter}
            GROUP BY month
            ORDER BY month
        ''', params).fetchall()
        
        # Filament consumption over time
        filament_over_time = conn.execute(f'''
            SELECT 
                strftime('%Y-%m', p.created_at) as month,
                f.name as filament_name,
                SUM(p.filament_grams) as grams
            FROM prints p
            JOIN filaments f ON p.filament_type_id = f.id
            WHERE 1=1 {date_filter}
            GROUP BY month, f.name
            ORDER BY month, f.name
        ''', params).fetchall()
        
        # Costs per month
        costs_per_month = conn.execute(f'''
            SELECT 
                strftime('%Y-%m', p.created_at) as month,
                SUM(p.price) as total_cost
            FROM prints p
            WHERE 1=1 {date_filter}
            GROUP BY month
            ORDER BY month
        ''', params).fetchall()
        
        # Top uploaders
        top_uploaders = conn.execute(f'''
            SELECT 
                p.uploader,
                COUNT(*) as print_count,
                SUM(p.filament_grams) as total_grams,
                AVG(p.filament_grams) as avg_grams
            FROM prints p
            WHERE 1=1 {date_filter}
            GROUP BY p.uploader
            ORDER BY print_count DESC
            LIMIT 5
        ''', params).fetchall()
        
        # Average consumption per filament type
        avg_per_filament = conn.execute(f'''
            SELECT 
                f.name as filament_name,
                AVG(p.filament_grams) as avg_grams,
                COUNT(*) as print_count
            FROM prints p
            JOIN filaments f ON p.filament_type_id = f.id
            WHERE 1=1 {date_filter}
            GROUP BY f.name
            ORDER BY avg_grams DESC
        ''', params).fetchall()
        
        conn.close()
        
        return {
            "total_stats": dict(total_stats) if total_stats else {},
            "prints_per_month": [dict(row) for row in prints_per_month],
            "filament_over_time": [dict(row) for row in filament_over_time],
            "costs_per_month": [dict(row) for row in costs_per_month],
            "top_uploaders": [dict(row) for row in top_uploaders],
            "avg_per_filament": [dict(row) for row in avg_per_filament]
        }