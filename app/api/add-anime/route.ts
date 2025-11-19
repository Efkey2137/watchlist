import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  console.log('API Route called'); // Log 1
  
  try {
    const body = await request.json();
    console.log('Received ', body); // Log 2
    
    const filePath = path.join(process.cwd(), 'app/data/list.json');
    console.log('File path:', filePath); // Log 3
    
    // Sprawdź czy plik istnieje
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log('Current file content length:', fileContent.length); // Log 4
    
    const currentList = JSON.parse(fileContent);
    console.log('Current list length:', currentList.length); // Log 5
    
    let order = undefined;
    if (body.status === 'planned') {
      const plannedItems = currentList.filter((item: any) => item.status === 'planned');
      order = plannedItems.length > 0 
        ? Math.max(...plannedItems.map((item: any) => item.order || 0)) + 1 
        : 1;
    }
    
    const newItem = {
      name: body.name,
      status: body.status,
      score: body.status === 'planned' ? 0 : Number(body.score) || 0,
      tier: body.status === 'planned' ? '' : body.tier || '',
      ...(order && { order })
    };
    
    console.log('New item:', newItem);
    
    currentList.push(newItem);
    
    fs.writeFileSync(filePath, JSON.stringify(currentList, null, 2), 'utf-8');
    console.log('File written successfully'); // Log 7
    
    const verifyContent = fs.readFileSync(filePath, 'utf-8');
    const verifyList = JSON.parse(verifyContent);
    console.log('Verified list length:', verifyList.length); // Log 8
    
    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Error in API route:', error); // Log error
    return NextResponse.json({ 
      error: 'Failed to add anime', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
